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
    public ScanResponse scan(@RequestBody ScanRequest req) {
        String raw = "";
        if (req != null) {
            if (req.value != null && !req.value.isEmpty()) raw = req.value;
            else if (req.url != null && !req.url.isEmpty()) raw = req.url;
        }
        String url = raw.toLowerCase();
        List<String> reasons = new ArrayList<>();
        int score = 0;

        // Demo scoring rules (tunable for production)
        if (url.contains("bit.ly") || url.contains("bitly")) {
            score += 50;
            reasons.add("Detected shortened URL");
        }
        if (url.contains("verify")) {
            score += 30;
            reasons.add("Contains 'verify'");
        }
        if (url.contains("login")) {
            score += 30;
            reasons.add("Contains 'login'");
        }
        if (url.contains("urgent")) {
            score += 20;
            reasons.add("Contains 'urgent'");
        }

        String verdict;
        if (score >= 60) verdict = "SCAM";
        else if (score >= 30) verdict = "SUSPICIOUS";
        else verdict = "SAFE";

        return new ScanResponse(verdict, score, reasons);
    }
}