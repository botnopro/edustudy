package com.edustudy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@SpringBootApplication
@EnableJpaAuditing
public class EduStudyApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(EduStudyApplication.class, args);
    }

    private static void loadEnv() {
        File[] candidates = new File[] {
            new File(".env"),
            new File("backend/.env"),
            new File("../.env")
        };
        for (File envFile : candidates) {
            if (envFile.exists() && envFile.isFile()) {
                try (var reader = Files.newBufferedReader(envFile.toPath(), StandardCharsets.UTF_8)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
