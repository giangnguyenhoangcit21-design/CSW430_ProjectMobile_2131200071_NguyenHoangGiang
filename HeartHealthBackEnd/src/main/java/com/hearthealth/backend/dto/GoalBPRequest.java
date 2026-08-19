package com.hearthealth.backend.dto;

import lombok.Data;

@Data
public class GoalBPRequest {
    private String email;

    private String weekRange;
    private String bpTarget;
    private Integer activeMins;
}

