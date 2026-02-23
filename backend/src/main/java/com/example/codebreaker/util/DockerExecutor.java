package com.example.codebreaker.util;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DockerExecutor {

    private static final int TIMEOUT_SECONDS = 30;
    private static final DateTimeFormatter LOG_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static String TEMP_DIR;

    private static synchronized void initIfNeeded() {
        if (TEMP_DIR != null) return;
        TEMP_DIR = resolveTempDirectory();
        File tempDir = new File(TEMP_DIR);
        if (!tempDir.exists() && !tempDir.mkdirs()) {
            logInfo("Warning: Could not create/verify directory: " + TEMP_DIR);
        }
    }

    private static String resolveTempDirectory() {
        String envPath = System.getenv("EXECUTOR_CONTAINER_PATH");
        if (envPath != null && !envPath.isEmpty()) return envPath;
        if (isWindows()) {
            String base = System.getProperty("java.io.tmpdir");
            return new File(base, "codebreaker-executor").getAbsolutePath();
        }
        return "/executor";
    }

    private static String resolveHostDirectory() {
        String hostPath = System.getenv("EXECUTOR_HOST_PATH");
        if (hostPath != null && !hostPath.isEmpty()) return hostPath;
        return resolveTempDirectory();
    }

    public static BatchExecutionResult executeBatch(String language, String code, List<String> inputs) {
        initIfNeeded();
        String executionId = UUID.randomUUID().toString().substring(0, 8);
        String subDirName = "exec_" + executionId;
        Path subDirPath = Paths.get(TEMP_DIR, subDirName);
        
        long buildTime = 0;
        long executionTime = 0;

        try {
            Files.createDirectories(subDirPath);
            
            
            String codeFilename = getFilenameForLanguage(language);
            Files.write(subDirPath.resolve(codeFilename), code.getBytes());

            
            for (int i = 0; i < inputs.size(); i++) {
                Files.write(subDirPath.resolve("in_" + i + ".txt"), (inputs.get(i) == null ? "" : inputs.get(i)).getBytes());
            }

            
            long startTime = System.currentTimeMillis();
            ProcessBuilder pb = buildBatchDockerCommand(language, subDirName, inputs.size());
            Process process = pb.start();

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long endTime = System.currentTimeMillis();
            
            if (!finished) {
                process.destroyForcibly();
                cleanupRecursive(subDirPath);
                return BatchExecutionResult.error("Execution timed out after " + TIMEOUT_SECONDS + "s");
            }

            String stdout = readStream(process.getInputStream());
            String stderr = readStream(process.getErrorStream());
            int exitCode = process.exitValue();
            
            cleanupRecursive(subDirPath);

            if (exitCode != 0 && stdout.isEmpty()) {
                return BatchExecutionResult.error(stderr.isEmpty() ? "Runtime error (" + exitCode + ")" : stderr);
            }

            
            List<String> results = parseBatchOutput(stdout);
            
            
            buildTime = (language.equalsIgnoreCase("java") || language.equalsIgnoreCase("cpp")) ? (endTime - startTime) / 3 : 0;
            executionTime = (endTime - startTime) - buildTime;

            return BatchExecutionResult.success(results, buildTime, executionTime);

        } catch (Exception e) {
            logError("Batch execution failed: " + e.getMessage());
            cleanupRecursive(subDirPath);
            return BatchExecutionResult.error(e.getMessage());
        }
    }

    private static String getFilenameForLanguage(String lang) {
        return switch (lang.toLowerCase()) {
            case "python" -> "Main.py";
            case "javascript" -> "Main.js";
            case "java" -> "Main.java";
            case "cpp" -> "Main.cpp";
            default -> "Main.txt";
        };
    }

    private static ProcessBuilder buildBatchDockerCommand(String language, String subDirName, int count) {
        String hostDir = resolveHostDirectory();
        
        
        String hostSubDir = hostDir.endsWith("/") || hostDir.endsWith("\\") ? hostDir + subDirName : hostDir + "/" + subDirName;
        String volumePath = convertPathForDocker(hostSubDir);
        
        String image = getDockerImage(language);

        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");
        command.add("--memory=512m");
        command.add("--cpus=1.0");
        command.add("--pids-limit=64");
        command.add("--network=none");
        command.add("-v");
        command.add(volumePath + ":/code:ro");
        command.add(image);
        command.add("bash");
        command.add("-c");
        command.add(buildScript(language, count));

        return new ProcessBuilder(command);
    }

    private static String buildScript(String language, int count) {
        StringBuilder script = new StringBuilder();
        script.append("cd /code && ");

        if (language.equalsIgnoreCase("java")) {
            script.append("javac Main.java && ");
        } else if (language.equalsIgnoreCase("cpp")) {
            script.append("g++ Main.cpp -O2 -o main && ");
        }

        String runCmd = switch (language.toLowerCase()) {
            case "python" -> "python3 Main.py";
            case "javascript" -> "node Main.js";
            case "java" -> "java Main";
            case "cpp" -> "./main";
            default -> "cat";
        };

        script.append("for i in $(seq 0 ").append(count - 1).append("); do ");
        script.append("if [ -f in_$i.txt ]; then cat in_$i.txt | ").append(runCmd).append("; fi; ");
        script.append("echo '---BATCH_DELIMITER---'; done");

        return script.toString();
    }

    private static List<String> parseBatchOutput(String stdout) {
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

    private static String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "python" -> "python:3.9-slim";
            case "javascript" -> "node:18-slim";
            case "java" -> "eclipse-temurin:17-alpine";
            case "cpp" -> "gcc:latest";
            default -> "python:3.9-slim";
        };
    }

    private static String convertPathForDocker(String path) {
        String p = path.replace("\\", "/");
        
        
        if (p.length() > 2 && p.charAt(1) == ':') {
            char drive = Character.toLowerCase(p.charAt(0));
            p = "/" + drive + p.substring(2);
        }
        return p;
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    private static String readStream(InputStream is) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString();
    }

    private static void cleanupRecursive(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            }
        } catch (IOException e) {
            logError("Cleanup failed: " + e.getMessage());
        }
    }

    private static void logInfo(String msg) {
        System.out.println("[" + LocalDateTime.now().format(LOG_TIME) + "] [DockerExecutor] " + msg);
    }

    private static void logError(String msg) {
        System.err.println("[" + LocalDateTime.now().format(LOG_TIME) + "] [DockerExecutor] ERROR " + msg);
    }

    public static class BatchExecutionResult {
        public final boolean success;
        public final List<String> outputs;
        public final String errorMessage;
        public final long buildTimeMs;
        public final long executionTimeMs;

        private BatchExecutionResult(boolean success, List<String> outputs, String error, long bTime, long eTime) {
            this.success = success;
            this.outputs = outputs;
            this.errorMessage = error;
            this.buildTimeMs = bTime;
            this.executionTimeMs = eTime;
        }

        public static BatchExecutionResult success(List<String> outputs, long b, long e) {
            return new BatchExecutionResult(true, outputs, null, b, e);
        }

        public static BatchExecutionResult error(String error) {
            return new BatchExecutionResult(false, null, error, 0, 0);
        }
    }

    public static class ExecutionResult {
        public final boolean success;
        public final String output;
        public final String error;
        private ExecutionResult(boolean s, String o, String e) { this.success = s; this.output = o; this.error = e; }
        public static ExecutionResult success(String o) { return new ExecutionResult(true, o, null); }
        public static ExecutionResult error(String e) { return new ExecutionResult(false, null, e); }
    }
}
