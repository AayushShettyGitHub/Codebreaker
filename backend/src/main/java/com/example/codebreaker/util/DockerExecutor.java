package com.example.codebreaker.util;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class DockerExecutor {

    private static final int TIMEOUT_SECONDS = 15;
    private static final String TEMP_DIR =
            System.getProperty("java.io.tmpdir") + File.separator + "codebreaker";

    static {
        new File(TEMP_DIR).mkdirs();
    }

    public static ExecutionResult execute(String language, String code, String input) {
        try {
            String codeFile = writeCodeFile(language, code);
            ProcessBuilder pb = buildDockerCommand(language, codeFile);

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

            cleanup(codeFile);

            if (process.exitValue() != 0) {
                return ExecutionResult.error(stderr.isEmpty() ? "Runtime error" : stderr);
            }

            return ExecutionResult.success(stdout);

        } catch (Exception e) {
            return ExecutionResult.error(e.getMessage());
        }
    }

    private static String writeCodeFile(String language, String code) throws IOException {
        String ext = switch (language.toLowerCase()) {
            case "python" -> ".py";
            case "javascript" -> ".js";
            case "java" -> ".java";
            case "cpp" -> ".cpp";
            default -> ".txt";
        };

        String path = TEMP_DIR + File.separator + "Main" + ext;
        Files.write(Paths.get(path), code.getBytes());
        return path;
    }

    private static ProcessBuilder buildDockerCommand(String language, String codeFile) {
        String cmd;

        switch (language.toLowerCase()) {
            case "python":
                cmd = String.format(
                        "docker run --rm -i -v \"%s:/code\" python:3.9 python /code/%s",
                        TEMP_DIR, new File(codeFile).getName()
                );
                break;

            case "javascript":
                cmd = String.format(
                        "docker run --rm -i -v \"%s:/code\" node:18 node /code/%s",
                        TEMP_DIR, new File(codeFile).getName()
                );
                break;

            case "java":
                cmd = String.format(
                        "docker run --rm -i -v \"%s:/code\" eclipse-temurin:17 " +
                                "bash -c \"cd /code && javac Main.java && java Main\"",
                        TEMP_DIR
                );
                break;

            case "cpp":
                cmd = String.format(
                        "docker run --rm -i -v \"%s:/code\" gcc:latest " +
                                "bash -c \"cd /code && g++ Main.cpp -o main && ./main\"",
                        TEMP_DIR
                );
                break;

            default:
                throw new IllegalArgumentException("Unsupported language");
        }

        if (isWindows()) {
            return new ProcessBuilder("cmd.exe", "/c", cmd);
        } else {
            return new ProcessBuilder("sh", "-c", cmd);
        }
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    private static String read(InputStream is) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line).append("\n");
        return sb.toString().trim();
    }

    private static void cleanup(String file) {
        try {
            Files.deleteIfExists(Paths.get(file));
        } catch (Exception ignored) {}
    }

    // ---------------- result ----------------

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
            return new ExecutionResult(false, null, "Execution timeout (5 seconds)");
        }
    }
}
