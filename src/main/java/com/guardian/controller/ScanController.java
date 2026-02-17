package com.guardian.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.guardian.model.*;
import com.guardian.service.*;
import com.guardian.engine.*;

import java.util.*;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    @Autowired StaticAnalysisService staticService;
    @Autowired MLService mlService;
    @Autowired ContextService contextService;
    @Autowired DecisionEngine decisionEngine;

    @PostMapping
    public ScanResponse scan(@RequestBody ScanRequest req) {

        List<String> reasons = new ArrayList<>();
        int score = 0;

        score += staticService.analyze(req.value, reasons);
        score += mlService.analyzeText(req.value, reasons);
        score += contextService.analyze(req.source, req.time);

        String verdict = decisionEngine.decide(score);
        return new ScanResponse(verdict, score, reasons);
    }
}