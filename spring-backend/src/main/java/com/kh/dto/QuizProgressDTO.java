package com.kh.dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class QuizProgressDTO {
	private int quizProgressNumber;
	private String uno;
	private int chapterNumber;
	private int progressCount;
	private int totalQuizzes;
}