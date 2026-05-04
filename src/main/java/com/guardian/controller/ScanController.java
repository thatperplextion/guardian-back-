package com.guardian.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.guardian.model.*;
import com.guardian.service.*;
import com.guardian.engine.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/scan")
public class ScanController {

    @Autowired StaticAnalysisService staticService;
    @Autowired MLService mlService;
    @Autowired ContextService contextService;
    @Autowired DecisionEngine decisionEngine;

    @GetMapping("/")
    public String home() {
        return "Guardian Backend is running.";
    }

    @PostMapping("/")
    public ScanResponse scan(@RequestBody ScanRequest request) {
        String raw = "";
        if (request != null) {
            if (request.getValue() != null && !request.getValue().isEmpty()) {
                raw = request.getValue();
            } else if (request.url != null && !request.url.isEmpty()) {
                raw = request.url;
            }
        }
        String url = raw.toLowerCase();
        int score = 0;

        if (url.contains("bit.ly")) score += 50;
        if (url.contains("verify")) score += 30;
        if (url.contains("login")) score += 30;
        if (url.contains("urgent")) score += 20;
        if (url.startsWith("http://")) score += 20;

        String verdict;
        if (score >= 60) verdict = "SCAM";
        else if (score >= 30) verdict = "SUSPICIOUS";
        else verdict = "SAFE";

        return new ScanResponse(
            verdict,
            score,
            List.of("Rule-based detection triggered")
        );
    }
}