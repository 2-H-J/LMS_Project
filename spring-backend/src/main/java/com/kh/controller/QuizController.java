package com.kh.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.kh.dto.ClassQuizProgressDTO;
import com.kh.dto.QuizDTO;
import com.kh.dto.QuizRecordDTO;
import com.kh.service.ChapterService;
import com.kh.service.ClassService;
import com.kh.service.QuizService;
import com.kh.service.VideoService;
import com.kh.token.JwtTokenProvider;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@AllArgsConstructor
public class QuizController {
	private final QuizService quizService;
	private final ChapterService chapterService;
	private final JwtTokenProvider tokenProvider;

	@PostMapping("/quiz/insert")
	public Map<String, Object> insertQuiz(@RequestBody Map<String, Object> body) {
		Map<String, Object> result = new HashMap<>();

		// 1. chapterNumber 추출
		int chapterNumber = (int) body.get("chapterNumber");
		System.out.println(chapterNumber);
		// 2. quizzes 리스트 추출 (List<Map<String, Object>> 형태로 받아야 함)
		List<Map<String, Object>> quizzesData = (List<Map<String, Object>>) body.get("quizzes");

		// 3. Map을 QuizDTO 리스트로 변환
		List<QuizDTO> quizList = new ArrayList<>();
		for (Map<String, Object> quizData : quizzesData) {
			QuizDTO quiz = new QuizDTO(0, // quizId (자동 생성이면 0)
					chapterNumber, (int) quizData.get("quizNumber"), (String) quizData.get("question"),
					(String) quizData.get("answer"), (String) quizData.get("description"));
			quizList.add(quiz);
		}
		System.out.println(quizList);
		// 4. 서비스에 넘겨서 저장
		int count = quizService.insertQuizzes(quizList);
		if (count == 0) {
			result.put("msg", "퀴즈 등록 실패");
			return result;
		}
		result.put("msg", "퀴즈 등록 성공");
		return result;
	}

	@DeleteMapping("/quiz/{chapterNumber}")
	public Map<String, Object> deleteQuiz(@PathVariable int chapterNumber) {
		Map<String, Object> map = new HashMap<>();
		int count = quizService.deleteQuiz(chapterNumber);
		if (count == 0) {
			map.put("msg", "퀴즈 삭제 실패");
			return map;
		}
		map.put("msg", "퀴즈 삭제 성공");
		return map;
	}

	@GetMapping("/quiz/list/{chapterNumber}")
	public Map<String, Object> selectQuizList(@PathVariable int chapterNumber) {
		Map<String, Object> result = new HashMap<>();
		String chapterName = chapterService.getChapterName(chapterNumber);
		List<QuizDTO> quizList = quizService.selectQuizList(chapterNumber);
		result.put("quizList", quizList);
		result.put("chapterName", chapterName);
		return result;
	}

	@PostMapping("/quiz/update")
	public Map<String, Object> updateQuiz(@RequestBody Map<String, Object> body) {
		Map<String, Object> result = new HashMap<>();

		// 1. chapterNumber 추출
		int chapterNumber = (int) body.get("chapterNumber");
		System.out.println(chapterNumber);
		quizService.deleteQuiz(chapterNumber);
		// 2. quizzes 리스트 추출 (List<Map<String, Object>> 형태로 받아야 함)
		List<Map<String, Object>> quizzesData = (List<Map<String, Object>>) body.get("quizzes");

		// 3. Map을 QuizDTO 리스트로 변환
		List<QuizDTO> quizList = new ArrayList<>();
		for (Map<String, Object> quizData : quizzesData) {
			QuizDTO quiz = new QuizDTO(0, // quizId (자동 생성이면 0)
					chapterNumber, (int) quizData.get("quizNumber"), (String) quizData.get("question"),
					(String) quizData.get("answer"), (String) quizData.get("description"));
			quizList.add(quiz);
		}
		System.out.println(quizList);
		// 4. 서비스에 넘겨서 저장
		int count = quizService.insertQuizzes(quizList);
		if (count == 0) {
			result.put("msg", "퀴즈 수정 실패");
			return result;
		}
		result.put("msg", "퀴즈 수정 완료");
		return result;
	}

	@PostMapping("/quiz/submit")
	public Map<String, Object> submitQuiz(@RequestHeader("Authorization") String token,
			@RequestBody Map<String, Object> body) {
		Map<String, Object> result = new HashMap<>();
		token = token != null ? token.replace("Bearer ", "") : null;
		// JWT에서 userId(uno) 추출
		String uno = tokenProvider.getUserNumberFromToken(token);
		if (uno == null) {
			result.put("msg", "유효하지 않은 토큰입니다.");
			return result;
		}

		// 요청 데이터 받기
		int chapterNumber = Integer.parseInt(body.get("chapterNumber").toString());
		int quizId = (int) body.get("quizId");
		String selectedAnswer = (String) body.get("selectedAnswer");
		boolean isCorrect = (boolean) body.get("isCorrect");
		int progressCount = (int) body.get("progressCount");
		int totalQuizzes = (int) body.get("totalQuizzes");
		// DTO 변환
		QuizRecordDTO quizRecord = new QuizRecordDTO();
		quizRecord.setUno(uno);
		quizRecord.setChapterNumber(chapterNumber);
		quizRecord.setQuizId(quizId);
		quizRecord.setSelectedAnswer(selectedAnswer);
		quizRecord.setCorrect(isCorrect);
		// 퀴즈 기록 저장
		int count = quizService.saveQuizRecord(quizRecord);
		quizService.updateQuizProgress(uno, chapterNumber, progressCount, totalQuizzes);
		if (count == 0) {
			result.put("msg", "퀴즈 저장 실패");
			return result;
		}
		result.put("msg", "퀴즈 저장 성공");
		return result;
	}
	
	@GetMapping("/quiz/correctCount/{chapterNumber}")
	public Map<String, Object> quizCorrect(@PathVariable int chapterNumber, @RequestHeader("Authorization") String token){
		Map<String, Object> map = new HashMap<>();
		token = token != null ? token.replace("Bearer ", "") : null;
		String uno = tokenProvider.getUserNumberFromToken(token);
		int correctCount = quizService.getCorrectCount(uno, chapterNumber);
		map.put("correctCount", correctCount);
		return map;
	}
	
	@GetMapping("/quiz/progress/{chapterNumber}")
	public Map<String, Object> quizProgress(@PathVariable int chapterNumber, @RequestHeader("Authorization") String token){
		Map<String, Object> map = new HashMap<>();
		token = token != null ? token.replace("Bearer ", "") : null;
		String uno = tokenProvider.getUserNumberFromToken(token);
		int progressCount = quizService.getProgressCount(uno, chapterNumber);
		map.put("progressCount", progressCount);
		return map;
	}
	
	@GetMapping("/class/quiz/progress/{classNumber}")
	public Map<String, Object> classQuizProgress(
	        @PathVariable int classNumber, 
	        @RequestHeader("Authorization") String token) {
	    
	    Map<String, Object> map = new HashMap<>();
	    token = token != null ? token.replace("Bearer ", "") : null;
	    String uno = tokenProvider.getUserNumberFromToken(token);

	    System.out.println(classNumber);
	    
	    // 리스트 형태로 변경
	    List<ClassQuizProgressDTO> list = quizService.getQuizProgressByClassNumber(uno, classNumber);
	    System.out.println(list);

	    map.put("quizProgress", list);
	    return map;
	}

}