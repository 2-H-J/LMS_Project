package com.kh.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kh.dto.ClassQuizProgressDTO;
import com.kh.dto.QuizDTO;
import com.kh.dto.QuizProgressDTO;
import com.kh.dto.QuizRecordDTO;
import com.kh.mapper.QuizMapper;

@Service
public class QuizService {
	private final QuizMapper quizMapper;

	public QuizService(QuizMapper quizMapper) {
		this.quizMapper = quizMapper;
	}

	public int insertQuizzes(List<QuizDTO> quizList) {
		int quizCount = quizList.size();
		System.out.println(quizCount);
		int count = 1;
	    try {
	        quizList.forEach(item -> {
	            quizMapper.insertQuizItem(item);  // 항목 삽입
	            int chapterNumber = item.getChapterNumber();
	            Map<String, Object> map = new HashMap<>();
	            map.put("quizCount", quizCount);
	            map.put("chapterNumber", chapterNumber);
	            quizMapper.updateTotalQuizzes(map);
	        });
	        return count;
	    } catch (Exception e) {
	        // 삽입 중 예외 발생 시 처리
	        System.out.println("퀴즈 등록에 실패했습니다: " + e.getMessage());
	        return count = 0;
	    }
	}

	public int deleteQuiz(int chapterNumber) {
		return quizMapper.deleteQuiz(chapterNumber);
	}

	public List<QuizDTO> selectQuizList(int chapterNumber) {
		return quizMapper.selectQuizList(chapterNumber);
	}

	public int saveQuizRecord(QuizRecordDTO quizRecord) {
		return quizMapper.saveQuizRecord(quizRecord);
	}

	public void updateQuizProgress(String uno, int chapterNumber, int progressCount, int totalQuizzes) {
	    // 현재 사용자의 진행률 데이터가 있는지 확인
	    Map<String, Object> params = new HashMap<>();
	    params.put("uno", uno);
	    params.put("chapterNumber", chapterNumber);
	    
	    QuizProgressDTO existingProgress = quizMapper.getQuizProgress(params);

	    if (existingProgress == null) {
	        // 진행률 데이터가 없으면 INSERT (total_quizzes는 트리거로 자동 입력)
	        Map<String, Object> insertParams = new HashMap<>();
	        insertParams.put("uno", uno);
	        insertParams.put("chapterNumber", chapterNumber);
	        insertParams.put("progressCount", progressCount);
	        insertParams.put("totalQuizzes", totalQuizzes);
	        
	        quizMapper.insertQuizProgress(insertParams);
	    } else {
	        // 진행률 데이터가 있으면 UPDATE (현재 풀고 있는 문제 번호 증가)
	        Map<String, Object> updateParams = new HashMap<>();
	        updateParams.put("uno", uno);
	        updateParams.put("chapterNumber", chapterNumber);
	        updateParams.put("progressCount", progressCount);
	        updateParams.put("totalQuizzes", totalQuizzes);

	        quizMapper.updateQuizProgress(updateParams);
	    }
	}

	public int getCorrectCount(String uno, int chapterNumber) {
		Map<String, Object> params = new HashMap<>();
		params.put("uno", uno);
		params.put("chapterNumber", chapterNumber);
		int result = quizMapper.getCorrectCount(params);
		return result;
	}

	public Integer getProgressCount(String uno, int chapterNumber) {
		Map<String, Object> map = new HashMap<>();
		map.put("uno", uno);
		map.put("chapterNumber", chapterNumber);
		Integer progressCount = quizMapper.getProgressCount(map);
		return (progressCount != null) ? progressCount : 0;
	}

	public List<ClassQuizProgressDTO> getQuizProgressByClassNumber(String uno, int classNumber) {
		Map<String, Object> map = new HashMap<>();
		map.put("uno", uno);
		map.put("classNumber", classNumber);
		return quizMapper.getQuizProgressByClassNumber(map);
	}

	public List<ClassQuizProgressDTO> getClassProgress(String uno) {
		return quizMapper.getClassProgress(uno);
	}
}