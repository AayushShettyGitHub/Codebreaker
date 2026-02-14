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

    @Bean
    CommandLineRunner initDatabase(ProblemLibraryRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("Starting database seeding...");
                ClassPathResource jsonResource = new ClassPathResource("problems.json");

                if (jsonResource.exists()) {
                    seedFromJson(jsonResource, repository);
                } else {
                    System.err.println("problems.json not found in resources!");
                }
            }
        };
    }

    private void seedFromJson(ClassPathResource resource, ProblemLibraryRepository repository) {
        ObjectMapper mapper = new ObjectMapper();
        int count = 0;
        int limit = 200; 

        try (InputStream is = resource.getInputStream();
             JsonParser parser = mapper.getFactory().createParser(is)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) {
                System.err.println("JSON is not an array!");
                return;
            }

            while (parser.nextToken() == JsonToken.START_OBJECT && count < limit) {
                JsonNode node = mapper.readTree(parser);
                
                String name = node.has("name") ? node.get("name").asText() : "Unnamed Problem";
                String description = node.has("description") ? node.get("description").asText() : "";
                
                int diffLevel = node.has("difficulty") ? node.get("difficulty").asInt() : 3;
                String difficulty = "MEDIUM";
                if (diffLevel <= 2) difficulty = "EASY";
                else if (diffLevel >= 6) difficulty = "HARD";

                List<String> tags = new ArrayList<>();
                if (node.has("cf_tags") && node.get("cf_tags").isArray()) {
                    for (JsonNode tagNode : node.get("cf_tags")) {
                        tags.add(tagNode.asText());
                    }
                }

                String input = "";
                String output = "";
                if (node.has("public_tests")) {
                    JsonNode tests = node.get("public_tests");
                    if (tests.has("input") && tests.get("input").isArray() && tests.get("input").size() > 0) {
                        input = tests.get("input").get(0).asText();
                    }
                    if (tests.has("output") && tests.get("output").isArray() && tests.get("output").size() > 0) {
                        output = tests.get("output").get(0).asText();
                    }
                }

                ProblemLibrary problem = ProblemLibrary.builder()
                        .title(name)
                        .description(description)
                        .difficulty(difficulty)
                        .tags(tags)
                        .build();

                LibraryTestCase tc = LibraryTestCase.builder()
                        .input(input)
                        .output(output)
                        .problemLibrary(problem)
                        .build();

                problem.getTestCases().add(tc);

                if (node.has("generated_tests")) {
                    JsonNode genTests = node.get("generated_tests");
                    if (genTests.has("input") && genTests.has("output") &&
                        genTests.get("input").isArray() && genTests.get("output").isArray()) {
                        
                        JsonNode inputs = genTests.get("input");
                        JsonNode outputs = genTests.get("output");
                        int iterations = Math.min(inputs.size(), outputs.size());
                        
                        for (int i = 0; i < iterations; i++) {
                            LibraryTestCase htc = LibraryTestCase.builder()
                                    .input(inputs.get(i).asText())
                                    .output(outputs.get(i).asText())
                                    .problemLibraryHidden(problem)
                                    .build();
                            problem.getHiddenTestCases().add(htc);
                        }
                    }
                }

                try {
                    repository.save(problem);
                    count++;
                    if (count % 50 == 0) {
                        System.out.println("Seeded " + count + " problems...");
                    }
                } catch (Exception e) {
                    System.err.println("Error saving problem " + name + ": " + e.getMessage());
                }
            }

            System.out.println("Seeding complete. Total problems: " + count);

        } catch (Exception e) {
            System.err.println("Critical error during JSON seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
