package com.example.codebreaker.services;

import com.example.codebreaker.model.LibraryTestCase;
import com.example.codebreaker.model.ProblemLibrary;
import com.example.codebreaker.repo.ProblemLibraryRepository;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProblemLibraryService {

    private final ProblemLibraryRepository repository;
    private static final String JSON_FILE = "problems.json";
    private static final int LIMIT = 500;

    public ProblemLibraryService(ProblemLibraryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void seedLibrary(boolean force) {
        ClassPathResource resource = new ClassPathResource(JSON_FILE);
        if (!resource.exists()) {
            System.err.println("problems.json not found in classpath");
            return;
        }

        long problemCount = repository.count();
        if (!force && problemCount > 0) {
            System.out.println("Database already seeded with " + problemCount + " problems. Skipping re-seeding.");
            return;
        }

        int jsonCount = countProblemsInJson(resource);

        if (force) {
            System.out.println("Seeding problems (FORCED)...");
            seedFromJson(resource, true);
        } else if (problemCount == 0 || problemCount != jsonCount) {
            System.out.println("Seeding/Updating problems (DB: " + problemCount + ", JSON: " + jsonCount + ")...");
            seedFromJson(resource, true);
        } else {
            System.out.println("Database already seeded with " + problemCount + " problems. Skipping.");
        }
    }

    private int countProblemsInJson(ClassPathResource resource) {
        ObjectMapper mapper = new ObjectMapper();
        int count = 0;
        try (InputStream is = resource.getInputStream();
             JsonParser parser = mapper.getFactory().createParser(is)) {
            if (parser.nextToken() != JsonToken.START_ARRAY) return 0;
            while (parser.nextToken() == JsonToken.START_OBJECT && count < LIMIT) {
                mapper.readTree(parser);
                count++;
            }
        } catch (Exception e) {
            System.err.println("Error counting JSON problems: " + e.getMessage());
        }
        return count;
    }

    private void seedFromJson(ClassPathResource resource, boolean fullSeed) {
        ObjectMapper mapper = new ObjectMapper();
        int count = 0;

        try (InputStream is = resource.getInputStream();
             JsonParser parser = mapper.getFactory().createParser(is)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) return;

            while (parser.nextToken() == JsonToken.START_OBJECT && count < LIMIT) {
                JsonNode node = mapper.readTree(parser);
                String title = getText(node, "name");

                if (fullSeed) {
                    ProblemLibrary problem = repository.findByTitle(title).orElse(null);
                    if (problem == null) {
                        problem = buildProblem(node, title);
                    } else {
                        problem.setDescription(getText(node, "description"));
                        problem.getTestCases().clear();
                        problem.getHiddenTestCases().clear();
                    }
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
                    System.out.println("Processed " + count + " problems library...");
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
                diffLevel <= 3 ? "EASY" :
                diffLevel >= 10 ? "HARD" : "MEDIUM";

        Set<String> tags = new HashSet<>();
        if (node.has("cf_tags") && node.get("cf_tags").isArray()) {
            node.get("cf_tags").forEach(t -> tags.add(t.asText()));
        }

        return ProblemLibrary.builder()
                .title(title)
                .description(description)
                .difficulty(difficulty)
                .tags(tags)
                .testCases(new HashSet<>())
                .hiddenTestCases(new HashSet<>())
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
