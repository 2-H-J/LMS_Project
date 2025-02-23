package com.kh.dto;


import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class QNABoardDTO {
    private int askNumber;
    private String askTitle;
    private String askContent;
    private String askCreateTime;
    private String askUpdateTime;
    private String uno;
    private int classNumber;
    private int chapterNumber;
    private String name;
    private String chapterName;

}