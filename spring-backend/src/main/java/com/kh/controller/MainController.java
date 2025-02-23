package com.kh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import com.kh.dto.ClassDTO;
import com.kh.dto.ClassQuizProgressDTO;
import com.kh.dto.QNABoardDTO;
import com.kh.dto.UsersProgressDTO;
import com.kh.service.ClassService;
import com.kh.service.QNABoardService;
import com.kh.service.QuizService;
import com.kh.service.UsersProgressService;
import com.kh.token.JwtTokenProvider;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MainController {
	private ClassService classService;
	private QNABoardService qnaBoardService;
	private UsersProgressService usersProgressService;
	private QuizService quizService;

	private JwtTokenProvider tokenProvider;

	public MainController(ClassService classService, QNABoardService qnaBoardService,
			UsersProgressService usersProgressService, QuizService quizService, JwtTokenProvider tokenProvider) {
		this.classService = classService;
		this.qnaBoardService = qnaBoardService;
		this.usersProgressService = usersProgressService;
		this.quizService = quizService;
		this.tokenProvider = tokenProvider;
	}

	// 🔹 인증 없이 최신 강의 목록만 제공
	@GetMapping("/")
	public Map<String, Object> getLatestClasses() {
		Map<String, Object> map = new HashMap<>();
		List<ClassDTO> latestClasses = classService.selectLatestClasses();
		map.put("latestClasses", latestClasses);
		return map;
	}

	@GetMapping("/users")
	public Map<String, Object> main(@RequestHeader(value = "Authorization", required = false) String token) {
		Map<String, Object> map = new HashMap<>();
		// 최신 강의 조회
		String uno = null;
		int grade = 0;
		if (token != null && token.startsWith("Bearer ")) {
			token = token.replace("Bearer ", "");
			uno = tokenProvider.getUserNumberFromToken(token);
			grade = tokenProvider.getRoleFromToken(token);
		}

		if (grade == 1) {
			// 강의 조회
			List<ClassDTO> classList = classService.selectClassListByUno(uno);

			map.put("classList", classList);
		} else {
			// Q&A 조회
			List<QNABoardDTO> latestAsk = uno != null ? qnaBoardService.selectLatestAsks(uno) : null;
			// 수강 중인 강의 조회
			List<UsersProgressDTO> recentClasses = uno != null ? usersProgressService.selectRecentClasses(uno) : null;
			// 퀴즈 진행률 조회
			List<ClassQuizProgressDTO> classQuizProgress = quizService.getClassProgress(uno);
			System.out.println(classQuizProgress);

			map.put("latestAsk", latestAsk);
			map.put("recentClasses", recentClasses);
			map.put("classQuizProgress", classQuizProgress);
		}
		return map;
	}

	@GetMapping("/classList")
	public List<ClassDTO> getClassList() {
		return classService.getAllClasses();
	}

	@GetMapping("/dashboard")
	public Map<String, Object> dashBoard(@RequestHeader(value = "Authorization", required = false) String token) {
		String uno = null;
		int grade = 0;
		if (token != null && token.startsWith("Bearer ")) {
			token = token.replace("Bearer ", "");
			uno = tokenProvider.getUserNumberFromToken(token);
			grade = tokenProvider.getRoleFromToken(token);
		}

		Map<String, Object> map = new HashMap<>();
		if (grade == 1) {
			// 강의 조회
			List<ClassDTO> classList = classService.selectClassListByUno(uno);

			map.put("classList", classList);

			return map;
		} else {
			// 수강 중인 강의 조회
			List<UsersProgressDTO> recentClasses = uno != null ? usersProgressService.selectRecentClasses(uno) : null;
			// 퀴즈 진행률 조회
			List<ClassQuizProgressDTO> classQuizProgress = quizService.getClassProgress(uno);

			map.put("recentClasses", recentClasses);
			map.put("classQuizProgress", classQuizProgress);

			return map;
		}
	}
}