package com.kh.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ClassQuizProgressDTO {
	private String uno;
	private int classNumber;
	private int chapterNumber;
	private int classProgress;
	private int chapterProgress;
}