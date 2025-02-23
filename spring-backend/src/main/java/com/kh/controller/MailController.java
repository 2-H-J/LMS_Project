package com.kh.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.dto.UsersDTO;
import com.kh.service.MailService;
import com.kh.service.UsersService;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MailController {
	private final UsersService usersService;
	private final MailService mailService;

	public MailController(UsersService usersService, MailService mailService) {
		this.usersService = usersService;
		this.mailService = mailService;
	}

	// 인증 이메일 전송
	@PostMapping("/mailSend")
	public HashMap<String, Object> mailSend(@RequestBody Map<String, String> map) {
		HashMap<String, Object> result = new HashMap<>();
		String email = map.get("email");
		int count = usersService.checkEmail(email);
		if (count == 0) {
			try {
				mailService.sendMail(email);
				result.put("msg", "인증번호를 발송했습니다.");
			} catch (Exception e) {
				result.put("msg", "사용불가능한 이메일입니다.");
			}
		} else {
			result.put("msg", "이미 가입된 이메일 입니다.");
		}
		return result;
	}

	// 인증번호 일치여부 확인
	@PostMapping("/mailCheck")
	public Map<String, Object> mailCheck(@RequestBody Map<String, String> map) {
		Map<String, Object> result = new HashMap<>();
		String email = map.get("email");
		String inputCode = map.get("inputCode");
		boolean isMatch = mailService.verifyCode(email, inputCode); // 인증번호 검증
		if (isMatch) {
			result.put("msg", "인증이 완료되었습니다.");
		} else {
			result.put("msg", "인증이 실패하였습니다.");
		}
		return result;
	}

	// 아이디, 비밀번호 찾기용 인증 이메일 전송
	@PostMapping("/mailSend/idAndPwd")
	public HashMap<String, Object> mailSendForFindId(@RequestBody Map<String, String> map) {
		HashMap<String, Object> result = new HashMap<>();
		String email = map.get("email");

		// 1. 해당 이메일이 가입된 이메일인지 확인
		int count = usersService.checkEmail(email);
		if (count == 0) {
			result.put("msg", "가입되지 않은 이메일입니다.");
			return result;
		}
		// 2. 가입된 이메일이면 인증번호 전송
		try {
			mailService.sendMail(email);
			result.put("msg", "인증번호를 발송했습니다.");
		} catch (Exception e) {
			result.put("msg", "이메일 전송 실패");
		}
		return result;
	}

	// 인증번호 일치여부 확인 - 아이디 찾기
	@PostMapping("/mailCheck/id")
	public Map<String, Object> mailCheckId(@RequestBody Map<String, String> map) {
		Map<String, Object> result = new HashMap<>();
		String email = map.get("email");
		String inputCode = map.get("inputCode");
		boolean isMatch = mailService.verifyCode(email, inputCode); // 인증번호 검증
		System.out.println(isMatch);
		if (isMatch == true) {
			UsersDTO dto = usersService.findUserByEmail(email);
			String maskedId = maskUserId(dto.getId());
			result.put("maskedId", maskedId);
			result.put("msg", "인증이 완료되었습니다.");
			result.put("isMatch", isMatch);
		} else {
			result.put("msg", "인증에 실패하셨습니다.");
			result.put("isMatch", isMatch);
		}

		return result;
	}

	// 아이디 가리기 메서드
	public String maskUserId(String userId) {
		int maskStart = userId.length() / 2 - 1; // 중간 위치 계산
		int maskEnd = maskStart + 2; // 2글자 마스킹

		StringBuilder maskedId = new StringBuilder(userId);
		for (int i = maskStart; i < maskEnd; i++) {
			maskedId.setCharAt(i, '*');
		}

		return maskedId.toString();
	}

	// 인증번호 일치여부 확인 -비밀번호
	@PostMapping("/mailCheck/pwd")
	public Map<String, Object> mailCheckPwd(@RequestBody Map<String, String> map) {
		Map<String, Object> result = new HashMap<>();
		String email = map.get("email");
		String inputCode = map.get("inputCode");
		boolean isMatch = mailService.verifyCode(email, inputCode); // 인증번호 검증
		System.out.println(isMatch);
		if (isMatch == true) {
			UsersDTO dto = usersService.findUserByEmail(email);
			String uno = dto.getUno();
			result.put("uno", uno);
			result.put("msg", "인증이 완료되었습니다.");
			result.put("isMatch", isMatch);
		} else {
			result.put("msg", "인증에 실패하셨습니다.");
			result.put("isMatch", isMatch);
		}
		return result;
	}
}