package com.guardian.engine;

import org.springframework.stereotype.Component;

@Component
public class DecisionEngine {
    public String decide(int score) {
        if (score >= 60) return "SCAM";
        if (score >= 30) return "SUSPICIOUS";
        return "SAFE";
    }
}