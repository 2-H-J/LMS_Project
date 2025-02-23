package com.kh.dto;

import java.sql.Timestamp;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ClassDTO {
    private int classNumber;
    private String title;
    private String description;
    private String category;
    private Timestamp createTime;
    private Timestamp updateTime;
    private int rate;
    private String thumbnail;
    private String uno;
    private String name;

    private int chapterCount;
    private int videoCount;
    private int studentCount;
}
