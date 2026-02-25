package com.example.code_executor.service;

import com.example.code_executor.dto.ExecutionRequest;
import com.example.code_executor.dto.ExecutionResponse;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class LocalCodeExecutor {

    private static final int TIMEOUT_SECONDS = 15;
    private static final String TEMP_DIR = "/executor";

    public ExecutionResponse execute(ExecutionRequest request) {
        String executionId = UUID.randomUUID().toString().substring(0, 8);
        Path subDirPath = Paths.get(TEMP_DIR, "exec_" + executionId);
        
        long buildTime = 0;
        long executionTime = 0;

        try {
            Files.createDirectories(subDirPath);
            
            String language = request.getLanguage().toLowerCase();
            String code = request.getCode();
            List<String> inputs = request.getInputs();

            String filename = getFilename(language);
            Files.write(subDirPath.resolve(filename), code.getBytes());

            for (int i = 0; i < inputs.size(); i++) {
                Files.write(subDirPath.resolve("in_" + i + ".txt"), (inputs.get(i) == null ? "" : inputs.get(i)).getBytes());
            }

            long startTime = System.currentTimeMillis();
            if ("java".equals(language)) {
                ExecutionResult buildRes = runProcess(subDirPath, "javac", filename);
                if (!buildRes.success) {
                    cleanup(subDirPath);
                    return ExecutionResponse.builder().success(false).errorMessage(buildRes.error).build();
                }
                buildTime = System.currentTimeMillis() - startTime;
            } else if ("cpp".equals(language)) {
                ExecutionResult buildRes = runProcess(subDirPath, "g++", filename, "-o", "main");
                if (!buildRes.success) {
                    cleanup(subDirPath);
                    return ExecutionResponse.builder().success(false).errorMessage(buildRes.error).build();
                }
                buildTime = System.currentTimeMillis() - startTime;
            }

            startTime = System.currentTimeMillis();
            String runCmd = getRunCommandString(language);
            String batchScript = buildBatchScript(runCmd, inputs.size());
            
            ExecutionResult batchResult = runBatch(subDirPath, batchScript);
            if (!batchResult.success) {
                cleanup(subDirPath);
                return ExecutionResponse.builder().success(false).errorMessage(batchResult.error).build();
            }
            
            List<String> outputs = parseBatchOutput(batchResult.output);
            executionTime = System.currentTimeMillis() - startTime;

            cleanup(subDirPath);
            return ExecutionResponse.builder()
                    .success(true)
                    .outputs(outputs)
                    .buildTimeMs(buildTime)
                    .executionTimeMs(executionTime)
                    .build();

        } catch (Exception e) {
            cleanup(subDirPath);
            return ExecutionResponse.builder().success(false).errorMessage("Internal error: " + e.getMessage()).build();
        }
    }

    private String getFilename(String lang) {
        return switch (lang) {
            case "python" -> "Main.py";
            case "javascript" -> "Main.js";
            case "java" -> "Main.java";
            case "cpp" -> "Main.cpp";
            default -> "Main.txt";
        };
    }

    private String getRunCommandString(String lang) {
        return switch (lang) {
            case "python" -> "python3 Main.py";
            case "javascript" -> "node Main.js";
            case "java" -> "java Main";
            case "cpp" -> "./main";
            default -> "cat Main.txt";
        };
    }

    private String buildBatchScript(String runCmd, int count) {
        StringBuilder script = new StringBuilder();
        script.append("for i in $(seq 0 ").append(count - 1).append("); do ");
        script.append("if [ -f in_$i.txt ]; then cat in_$i.txt | ").append(runCmd).append("; fi; ");
        script.append("echo '---BATCH_DELIMITER---'; done");
        return script.toString();
    }

    private ExecutionResult runProcess(Path dir, String... cmd) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(dir.toFile());
        Process process = pb.start();
        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            return ExecutionResult.error("Compile timeout");
        }
        
        if (process.exitValue() != 0) {
            return ExecutionResult.error(readStream(process.getErrorStream()));
        }
        return ExecutionResult.success("");
    }

    private ExecutionResult runBatch(Path dir, String script) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("bash", "-c", script);
        pb.directory(dir.toFile());
        Process process = pb.start();
        
        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            return ExecutionResult.error("Runtime timeout");
        }
        
        String stdout = readStream(process.getInputStream());
        String stderr = readStream(process.getErrorStream());
        
        if (process.exitValue() != 0 && stdout.isEmpty()) {
            return ExecutionResult.error(stderr.isEmpty() ? "Runtime error" : stderr);
        }
        
        return ExecutionResult.success(stdout);
    }

    private List<String> parseBatchOutput(String stdout) {
        if (stdout == null || stdout.isEmpty()) return Collections.emptyList();
        String[] parts = stdout.split("---BATCH_DELIMITER---");
        List<String> results = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty() || results.size() < parts.length - 1) {
                results.add(trimmed);
            }
        }
        return results;
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private void cleanup(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            }
        } catch (IOException ignored) {}
    }

    private record ExecutionResult(boolean success, String output, String error) {
        static ExecutionResult success(String o) { return new ExecutionResult(true, o, null); }
        static ExecutionResult error(String e) { return new ExecutionResult(false, null, e); }
    }
}
