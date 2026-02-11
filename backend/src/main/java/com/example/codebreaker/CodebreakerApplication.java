package com.example.codebreaker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CodebreakerApplication {

    private static final Logger log =
            LoggerFactory.getLogger(CodebreakerApplication.class);

    public static void main(String[] args) {
        log.info("JVM starting: Codebreaker backend");
        SpringApplication.run(CodebreakerApplication.class, args);
    }
}
