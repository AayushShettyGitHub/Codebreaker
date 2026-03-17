package com.example.codebreaker.config;

import com.example.codebreaker.services.ProblemLibraryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ProblemLibraryService libraryService) {
        return args -> {
            libraryService.seedLibrary(false);
        };
    }
}
