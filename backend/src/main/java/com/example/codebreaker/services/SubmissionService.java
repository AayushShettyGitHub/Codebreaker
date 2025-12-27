package com.example.codebreaker.services;

import com.example.codebreaker.Dto.SubmissionRequest;
import com.example.codebreaker.Dto.SubmissionResult;

public interface SubmissionService {
    SubmissionResult submitCode(SubmissionRequest request);
}
