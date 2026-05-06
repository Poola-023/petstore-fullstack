package com.example.petstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class UshaPetStoreApplication {

    public static void main(String[] args) {
        // This single line launches the entire backend server
        SpringApplication.run(UshaPetStoreApplication.class, args);
        System.out.println("Usha Pet Store Backend is running on http://localhost:8080");
    }
}
