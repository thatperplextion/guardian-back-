package com.guardian.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MLService {
    public int analyzeText(String text, List<String> reasons) {
        int score = 0;
        String lower = text.toLowerCase();
        if (lower.contains("urgent") || lower.contains("verify")) {
            score += 25;
            reasons.add("Urgent phishing language detected");
        }
        return score;
    }
}