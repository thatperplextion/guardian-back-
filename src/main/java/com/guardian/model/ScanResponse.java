package com.guardian.model;

import java.util.List;

public class ScanResponse {
    public String verdict;
    public int riskScore;
    public List<String> reasons;

    public ScanResponse(String verdict, int riskScore, List<String> reasons) {
        this.verdict = verdict;
        this.riskScore = riskScore;
        this.reasons = reasons;
    }
}