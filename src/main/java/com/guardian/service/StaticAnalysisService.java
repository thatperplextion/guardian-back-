package com.guardian.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class StaticAnalysisService {

    public int analyze(String url, List<String> reasons) {
        int score = 0;
        if (url.contains("bit.ly") || url.contains("@")) {
            score += 20;
            reasons.add("Suspicious URL structure");
        }
        if (url.startsWith("http://")) {
            score += 10;
            reasons.add("Unsecured HTTP link");
        }
        return score;
    }
}