FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven wrapper and pom
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# ✅ FIX: Give execute permission to mvnw
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/*.jar"]