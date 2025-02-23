package com.kh.dto;

import lombok.*;
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class QuizRecordDTO {
	private int recordId;
	private String uno;
	private int quizId;
	private int chapterNumber;
	private String selectedAnswer;
	private boolean isCorrect;
	
	
}