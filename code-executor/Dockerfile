
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests


FROM eclipse-temurin:17-jdk-jammy

RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

RUN mkdir /executor && chmod 777 /executor

EXPOSE 8081

ENTRYPOINT ["java", "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-Xms256m", "-Xmx2g", "-jar", "app.jar"]
