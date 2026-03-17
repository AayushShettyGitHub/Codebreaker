package com.example.code_executor.service;

import com.example.code_executor.dto.ExecutionRequest;
import com.example.code_executor.dto.ExecutionResponse;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CodeExecutor {

    private static final int COMPILE_TIMEOUT_SECONDS = 10;
    private static final int RUN_TIMEOUT_SECONDS = 5;
    private static final int MAX_OUTPUT_LENGTH = 10000;
    private static final String TEMP_DIR = "/executor";

    private static final ExecutorService SHARED_EXECUTOR = Executors.newFixedThreadPool(128);

    public ExecutionResponse execute(ExecutionRequest request) {

        String executionId = UUID.randomUUID().toString().substring(0, 8);
        Path workingDir = Paths.get(TEMP_DIR, "exec_" + executionId);

        long buildTime = 0;
        long executionTime = 0;

        try {
            Files.createDirectories(workingDir);

            String language = request.getLanguage().toLowerCase();
            String code = request.getCode();
            List<String> inputs = request.getInputs();

            String fileName = getFileName(language);
            Path sourceFile = workingDir.resolve(fileName);
            Files.write(sourceFile, code.getBytes());
            for (int i = 0; i < inputs.size(); i++) {
                String input = inputs.get(i) == null ? "" : inputs.get(i);
                Files.write(workingDir.resolve("input_" + i + ".txt"), input.getBytes());
            }
            long compileStart = System.currentTimeMillis();
            if (language.equals("java") || language.equals("cpp")) {
                ExecutionResult compileResult = compileCode(language, workingDir, fileName);
                if (!compileResult.success) {
                    cleanup(workingDir);
                    return ExecutionResponse.builder()
                            .success(false)
                            .errorMessage(compileResult.error)
                            .build();
                }
            }
            buildTime = System.currentTimeMillis() - compileStart;

            long runStart = System.currentTimeMillis();
            List<String> outputs = runTestCasesInParallel(language, workingDir, inputs.size());
            executionTime = System.currentTimeMillis() - runStart;

            cleanup(workingDir);

            return ExecutionResponse.builder()
                    .success(true)
                    .outputs(outputs)
                    .buildTimeMs(buildTime)
                    .executionTimeMs(executionTime)
                    .build();

        } catch (Exception e) {
            cleanup(workingDir);
            return ExecutionResponse.builder()
                    .success(false)
                    .errorMessage("Internal error: " + e.getMessage())
                    .build();
        }
    }

    private ExecutionResult compileCode(String language, Path dir, String fileName) throws Exception {
        List<String> command = new ArrayList<>();

        if (language.equals("java")) {
            command = Arrays.asList("javac", fileName);
        } else if (language.equals("cpp")) {
            command = Arrays.asList("g++", fileName, "-O2", "-o", "main");
        }

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(dir.toFile());

        Process process = pb.start();
        boolean finished = process.waitFor(COMPILE_TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            return ExecutionResult.error("Compilation timeout");
        }

        if (process.exitValue() != 0) {
            String error = readStream(process.getErrorStream());
            return ExecutionResult.error(error.isEmpty() ? "Compilation error" : error);
        }

        return ExecutionResult.success("");
    }

    private List<String> runTestCasesInParallel(String language, Path dir, int testCaseCount) throws Exception {

        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < testCaseCount; i++) {
            final int index = i;
            futures.add(SHARED_EXECUTOR.submit(() -> runSingleTestCase(language, dir, index)));
        }

        List<String> results = new ArrayList<>();

        for (Future<String> future : futures) {
            try {
                String output = future.get(RUN_TIMEOUT_SECONDS + 2, TimeUnit.SECONDS);

                if (output != null && output.length() > MAX_OUTPUT_LENGTH) {
                    results.add("Output limit exceeded");
                } else {
                    results.add(output == null ? "Runtime error" : output.trim());
                }

            } catch (TimeoutException e) {
                results.add("Time limit exceeded");
            } catch (Exception e) {
                results.add("Runtime error: " + e.getMessage());
            }
        }

        return results;
    }

    private String runSingleTestCase(String language, Path dir, int index) throws Exception {
        List<String> command = getRunCommandList(language);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(dir.toFile());
        pb.redirectInput(dir.resolve("input_" + index + ".txt").toFile());
        pb.redirectErrorStream(true);
        Process process = pb.start();

        boolean finished = process.waitFor(RUN_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            return "Time limit exceeded";
        }
        String output = readStream(process.getInputStream());
        if (process.exitValue() != 0 && output.isEmpty()) return "Runtime error";
        return output;
    }

    private String getFileName(String language) {
        switch (language) {
            case "java":
                return "Main.java";
            case "cpp":
                return "Main.cpp";
            case "python":
                return "Main.py";
            case "javascript":
                return "Main.js";
            default:
                return "Main.txt";
        }
    }

    private List<String> getRunCommandList(String language) {
        switch (language) {
            case "java":
                return Arrays.asList("java", "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-XX:+UseSerialGC", "-Xss256k", "-Xmx128m", "Main");
            case "cpp":
                return Arrays.asList("./main");
            case "python":
                return Arrays.asList("python3", "-u", "Main.py");
            case "javascript":
                return Arrays.asList("node", "Main.js");
            default:
                return Arrays.asList("cat", "Main.txt");
        }
    }

    private String readStream(InputStream inputStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder output = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }

        return output.toString();
    }

    private void cleanup(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException ignored) {
        }
    }

    private static class ExecutionResult {
        boolean success;
        String output;
        String error;

        ExecutionResult(boolean success, String output, String error) {
            this.success = success;
            this.output = output;
            this.error = error;
        }

        static ExecutionResult success(String output) {
            return new ExecutionResult(true, output, null);
        }

        static ExecutionResult error(String error) {
            return new ExecutionResult(false, null, error);
        }
    }
}