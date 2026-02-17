package com.guardian.service;

import org.springframework.stereotype.Service;
import java.time.*;

@Service
public class ContextService {
    public int analyze(String source, String time) {
        int hour = LocalTime.parse(time).getHour();
        return (hour < 6) ? 10 : 0;
    }
}