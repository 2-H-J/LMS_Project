package com.kh.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.ClassQuizProgressDTO;
import com.kh.dto.QuizDTO;
import com.kh.dto.QuizProgressDTO;
import com.kh.dto.QuizRecordDTO;

@Mapper
public interface QuizMapper {

	void insertQuizItem(QuizDTO item);

	int deleteQuiz(int chapterNumber);

	List<QuizDTO> selectQuizList(int chapterNumber);

	int saveQuizRecord(QuizRecordDTO quizRecord);

	QuizProgressDTO getQuizProgress(Map<String, Object> params);

	void insertQuizProgress(Map<String, Object> insertParams);

	void updateQuizProgress(Map<String, Object> updateParams);

	int getCorrectCount(Map<String, Object> params);

	Integer getProgressCount(Map<String, Object> map);

	List<ClassQuizProgressDTO> getQuizProgressByClassNumber(Map<String, Object> map);

	List<ClassQuizProgressDTO> getClassProgress(String uno);

	void updateTotalQuizzes(Map<String, Object> map);

}