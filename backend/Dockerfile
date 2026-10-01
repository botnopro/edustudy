# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — Build the Spring Boot fat jar with Maven (Java 21)
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Resolve dependencies first so this layer is cached unless pom.xml changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build the application.
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------------------------------------------------------------------------
# Stage 2 — Minimal JRE runtime image
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Run as a non-root user.
RUN groupadd --system app && useradd --system --gid app app

# Copy only the executable fat jar (Spring Boot repackages the main jar;
# the *.jar.original is left behind and not matched here).
COPY --from=build /app/target/*.jar app.jar

USER app

# Render/most PaaS inject the port via $PORT; the app reads server.port=${PORT:8080}.
EXPOSE 8080

# Let the platform tune heap; respects container memory limits by default.
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
