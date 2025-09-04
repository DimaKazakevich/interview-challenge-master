FROM gradle:8.9-jdk17 AS builder
WORKDIR /app

COPY build.gradle settings.gradle gradlew* ./
COPY gradle ./gradle

RUN ./gradlew dependencies --no-daemon || return 0

COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
