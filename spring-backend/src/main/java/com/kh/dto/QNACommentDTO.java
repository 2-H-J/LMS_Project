package com.kh.dto;

import lombok.*;


@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class QNACommentDTO {
    private int askNumber;
    private int commentNumber;
    private String commentContent;
    private String commentCreateTime;
    private String uno;
    private String name;
}