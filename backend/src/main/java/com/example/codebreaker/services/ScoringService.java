package com.example.codebreaker.services;

import com.example.codebreaker.model.Submission;

public interface ScoringService {

    int applyScore(Submission submission);
}
