package com.kh.dto;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
	private int quizId;
	private int chapterNumber;
	private int quizNumber;
	private String question;
	private String answer;
	private String description;

}