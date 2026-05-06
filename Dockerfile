FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy maven wrapper & pom
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source
COPY src src

# Build the app
RUN ./mvnw clean package -DskipTests

# ✅ Copy the built jar to a fixed name
RUN cp target/*.jar app.jar

EXPOSE 8080

# ✅ Run fixed jar
ENTRYPOINT ["java", "-jar", "app.jar"]