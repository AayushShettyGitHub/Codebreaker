package com.example.codebreaker.config;

import com.example.codebreaker.model.LibraryTestCase;
import com.example.codebreaker.model.ProblemLibrary;
import com.example.codebreaker.repo.ProblemLibraryRepository;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final String JSON_FILE = "problems.json";
    private static final int LIMIT = 500;

    @Bean
    CommandLineRunner initDatabase(ProblemLibraryRepository repository) {
        return args -> {
            ClassPathResource resource = new ClassPathResource(JSON_FILE);
            if (!resource.exists()) return;

            long problemCount = repository.count();
            long hiddenTestCount = repository.countHiddenTests();

            if (problemCount == 0) {
                System.out.println("Seeding problems (fresh database)...");
                seedFromJson(resource, repository, true);
            } else if (hiddenTestCount == 0) {
                System.out.println("Problems exist but hidden tests missing. Fixing...");
                seedFromJson(resource, repository, false);
            } else {
                System.out.println("Database already seeded. Skipping.");
            }
        };
    }

    private void seedFromJson(ClassPathResource resource,
                              ProblemLibraryRepository repository,
                              boolean fullSeed) {

        ObjectMapper mapper = new ObjectMapper();
        int count = 0;

        try (InputStream is = resource.getInputStream();
             JsonParser parser = mapper.getFactory().createParser(is)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) return;

            while (parser.nextToken() == JsonToken.START_OBJECT && count < LIMIT) {
                JsonNode node = mapper.readTree(parser);
                String title = getText(node, "name");

                if (fullSeed) {
                    ProblemLibrary problem = buildProblem(node, title);
                    addPublicTest(node, problem);
                    addHiddenTests(node, problem);
                    repository.save(problem);
                } else {
                    repository.findByTitleWithHidden(title).ifPresent(problem -> {
                        if (problem.getHiddenTestCases().isEmpty()) {
                            int before = problem.getHiddenTestCases().size();
                            addHiddenTests(node, problem);
                            int added = problem.getHiddenTestCases().size() - before;

                            if (added > 0) {
                                System.out.println("Added " + added + " hidden tests to: " + title);
                                repository.save(problem);
                            }
                        }
                    });
                }

                count++;
                if (count % 50 == 0) {
                    System.out.println("Processed " + count + " problems...");
                }
            }

            System.out.println("Seeding complete. Total processed: " + count);

        } catch (Exception e) {
            System.err.println("Seeding error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private ProblemLibrary buildProblem(JsonNode node, String title) {
        String description = getText(node, "description");
        int diffLevel = node.has("difficulty") ? node.get("difficulty").asInt() : 3;

        String difficulty =
                diffLevel <= 2 ? "EASY" :
                diffLevel >= 6 ? "HARD" : "MEDIUM";

        List<String> tags = new ArrayList<>();
        if (node.has("cf_tags") && node.get("cf_tags").isArray()) {
            node.get("cf_tags").forEach(t -> tags.add(t.asText()));
        }

        return ProblemLibrary.builder()
                .title(title)
                .description(description)
                .difficulty(difficulty)
                .tags(tags)
                .build();
    }

    private void addPublicTest(JsonNode node, ProblemLibrary problem) {
        if (!node.has("public_tests")) return;

        JsonNode pt = node.get("public_tests");
        if (pt.has("input") && pt.get("input").size() > 0) {
            String input = pt.get("input").get(0).asText();
            String output = pt.has("output") && pt.get("output").size() > 0
                    ? pt.get("output").get(0).asText()
                    : "";

            LibraryTestCase testCase = LibraryTestCase.builder()
                    .input(input)
                    .output(output)
                    .problemLibrary(problem)
                    .build();

            problem.getTestCases().add(testCase);
        }
    }

    private void addHiddenTests(JsonNode node, ProblemLibrary problem) {
        if (!node.has("generated_tests")) return;

        JsonNode gen = node.get("generated_tests");
        if (!gen.has("input") || !gen.has("output")) return;

        JsonNode inputs = gen.get("input");
        JsonNode outputs = gen.get("output");

        int size = Math.min(inputs.size(), outputs.size());
        for (int i = 0; i < size; i++) {
            LibraryTestCase hidden = LibraryTestCase.builder()
                    .input(inputs.get(i).asText())
                    .output(outputs.get(i).asText())
                    .problemLibraryHidden(problem)
                    .build();

            problem.getHiddenTestCases().add(hidden);
        }
    }

    private String getText(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText() : "";
    }
}
