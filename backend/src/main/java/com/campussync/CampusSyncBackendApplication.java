package com.campussync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusSyncBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampusSyncBackendApplication.class, args);
	}

}
