package com.hearthealth.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HeartHealthBackEndApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeartHealthBackEndApplication.class, args);
    }

}
