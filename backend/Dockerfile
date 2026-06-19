FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/ ./backend/
RUN mvn -f backend/pom.xml -DskipTests clean package -U

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /workspace/backend/target/*.jar /app/app.jar
# Default port (can be overridden with PORT env var)
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
