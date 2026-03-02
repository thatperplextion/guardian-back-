package com.guardian.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        healthStatus.put("service", "Guardian Backend");
        healthStatus.put("version", "1.0.0");
        healthStatus.put("uptime", "Service is running");
        return healthStatus;
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        Map<String, String> pong = new HashMap<>();
        pong.put("message", "pong");
        pong.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return pong;
    }
}