# Build Stage
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Prefetch dependencies to speed up future builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
