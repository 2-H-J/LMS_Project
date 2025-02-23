package com.kh.dto;

import lombok.*;
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RateDTO {
    private int rateNumber;
    private String uno;
    private int classNumber;
    private int rateScore;
    private String rateContent;

    private String nickName;
}