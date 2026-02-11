package com.example.codebreaker.util;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DockerExecutor {

    private static final int TIMEOUT_SECONDS = 15;
    private static final DateTimeFormatter LOG_TIME =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    private static volatile boolean imagesChecked = false;
    private static String TEMP_DIR;

    private static synchronized void initIfNeeded() {
        if (TEMP_DIR != null) return;

        TEMP_DIR = resolveTempDirectory();
        
        // Ensure the directory exists internally
        File tempDir = new File(TEMP_DIR);
        if (!tempDir.exists() && !tempDir.mkdirs()) {
            // If it's a mounted volume like /executor, it might already exist or be read-only if permissions are tricky, 
            // but we usually need write access.
            logInfo("Warning: Could not create/verify directory: " + TEMP_DIR);
        }

        logInfo("Initialized internal temp directory: " + TEMP_DIR);
        logInfo("Using host path for Docker volumes: " + resolveHostDirectory());
    }

    private static String resolveTempDirectory() {
        // First check environment variable
        String envPath = System.getenv("EXECUTOR_CONTAINER_PATH");
        if (envPath != null && !envPath.isEmpty()) {
            return envPath;
        }

        if (isWindows()) {
            String base = System.getProperty("java.io.tmpdir");
            return new File(base, "codebreaker-executor").getAbsolutePath();
        }
        
        // Default for Linux/Docker
        return "/executor";
    }

    private static String resolveHostDirectory() {
        // The path on the HOST where the volumes are mounted. 
        // Docker daemon needs this path to find the files.
        String hostPath = System.getenv("EXECUTOR_HOST_PATH");
        if (hostPath != null && !hostPath.isEmpty()) {
            return hostPath;
        }
        
        // Fallback to internal path (works if not in a container or if paths match)
        return resolveTempDirectory();
    }

    public static ExecutionResult execute(String language, String code, String input) {
        try {
            initIfNeeded();

            if (!imagesChecked) {
                verifyDockerImages(language);
                imagesChecked = true;
            }

            logInfo("=== Starting Code Execution ===");
            logInfo("Language: " + language);

            String codeFile = writeCodeFile(language, code);
            logInfo("Code file created: " + codeFile);

            ProcessBuilder pb = buildDockerCommand(language, codeFile);
            logInfo("Docker command: " + String.join(" ", pb.command()));

            Process process = pb.start();

            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer =
                             new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                    writer.write(input);
                    writer.flush();
                }
            }

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return ExecutionResult.timeout();
            }

            String stdout = read(process.getInputStream());
            String stderr = read(process.getErrorStream());
            int exitCode = process.exitValue();

            cleanup(codeFile);

            if (exitCode != 0) {
                return ExecutionResult.error(
                        stderr.isEmpty()
                                ? "Runtime error (exit code " + exitCode + ")"
                                : stderr
                );
            }

            return ExecutionResult.success(stdout);

        } catch (Exception e) {
            logError("Execution failed: " + e.getMessage());
            return ExecutionResult.error(e.getMessage());
        }
    }

    private static void verifyDockerImages(String language) {
        try {
            String image = getDockerImage(language);
            ProcessBuilder pb = isWindows()
                    ? new ProcessBuilder("cmd.exe", "/c", "docker images | findstr " + image)
                    : new ProcessBuilder("sh", "-c", "docker images | grep " + image);

            Process p = pb.start();
            String out = read(p.getInputStream());
            p.waitFor();

            if (out == null || out.isEmpty()) {
                pullDockerImage(image);
            }
        } catch (Exception e) {
            logInfo("Image verification skipped: " + e.getMessage());
        }
    }

    private static void pullDockerImage(String image) {
        try {
            logInfo("Pulling Docker image: " + image);
            ProcessBuilder pb = isWindows()
                    ? new ProcessBuilder("cmd.exe", "/c", "docker pull " + image)
                    : new ProcessBuilder("sh", "-c", "docker pull " + image);

            Process p = pb.start();
            p.waitFor();
        } catch (Exception e) {
            logError("Docker pull failed: " + e.getMessage());
        }
    }

    private static String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "python" -> "python:3.9";
            case "javascript" -> "node:18";
            case "java" -> "eclipse-temurin:17";
            case "cpp" -> "gcc:latest";
            default -> "python:3.9";
        };
    }

    private static String writeCodeFile(String language, String code) throws IOException {
        String ext = switch (language.toLowerCase()) {
            case "python" -> ".py";
            case "javascript" -> ".js";
            case "java" -> ".java";
            case "cpp" -> ".cpp";
            default -> ".txt";
        };

        String filename = "Main" + ext;
        Path path = Paths.get(TEMP_DIR, filename);
        Files.write(path, code.getBytes());

        return path.toString();
    }

    private static ProcessBuilder buildDockerCommand(String language, String codeFile) {
        String hostDir = resolveHostDirectory();
        String volumePath = convertPathForDocker(hostDir);

        String cmd = switch (language.toLowerCase()) {
            case "python" ->
                    "docker run --rm -i -v \"" + volumePath + ":/code\" python:3.9 python /code/Main.py";
            case "javascript" ->
                    "docker run --rm -i -v \"" + volumePath + ":/code\" node:18 node /code/Main.js";
            case "java" ->
                    "docker run --rm -i -v \"" + volumePath + ":/code\" eclipse-temurin:17 " +
                            "bash -c \"cd /code && javac Main.java && java Main\"";
            case "cpp" ->
                    "docker run --rm -i -v \"" + volumePath + ":/code\" gcc:latest " +
                            "bash -c \"cd /code && g++ Main.cpp -o main && ./main\"";
            default ->
                    throw new IllegalArgumentException("Unsupported language");
        };

        return isWindows()
                ? new ProcessBuilder("cmd.exe", "/c", cmd)
                : new ProcessBuilder("sh", "-c", cmd);
    }

    private static String convertPathForDocker(String path) {
        return path.replace("\\", "/");
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    private static String read(InputStream is) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString().trim();
    }

    private static void cleanup(String file) {
        try {
            Files.deleteIfExists(Paths.get(file));
        } catch (Exception ignored) {
        }
    }

    private static void logInfo(String msg) {
        System.out.println("[" + LocalDateTime.now().format(LOG_TIME) + "] [DockerExecutor] " + msg);
    }

    private static void logError(String msg) {
        System.err.println("[" + LocalDateTime.now().format(LOG_TIME) + "] [DockerExecutor] ERROR " + msg);
    }

    public static class ExecutionResult {
        public final boolean success;
        public final String output;
        public final String error;

        private ExecutionResult(boolean success, String output, String error) {
            this.success = success;
            this.output = output;
            this.error = error;
        }

        public static ExecutionResult success(String output) {
            return new ExecutionResult(true, output, null);
        }

        public static ExecutionResult error(String error) {
            return new ExecutionResult(false, null, error);
        }

        public static ExecutionResult timeout() {
            return new ExecutionResult(false, null, "Execution timeout (15 seconds)");
        }
    }
}
