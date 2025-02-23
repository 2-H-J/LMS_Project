package com.kh.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ChapterDTO {
    private int chapterNumber;
    private int classNumber;
    private String chapterName;
    private String chapterCreateTime;
    private int quizCount;
}
