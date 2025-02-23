package com.kh.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

	private final JavaMailSender javaMailSender;
	private static final String senderEmail = "chltmddls1@gmail.com";
	// 사용자별 인증번호 저장 (이메일 -> 인증번호)
	private final Map<String, Integer> verificationMap = new HashMap<>();

	// 랜덤으로 숫자 생성
	public int createNumber() {
		return (int) (Math.random() * (90000)) + 100000;
	}

	public MimeMessage createMail(String email, int number) {
		MimeMessage message = javaMailSender.createMimeMessage();

		try {
			message.setFrom(senderEmail);
			message.setRecipients(MimeMessage.RecipientType.TO, email);
			message.setSubject("이메일 인증");
			String body = "<h3>요청하신 인증 번호입니다.</h3>";
			body += "<h1>" + number + "</h1>";
			body += "<h3>감사합니다.</h3>";
			message.setText(body, "UTF-8", "html");
		} catch (MessagingException e) {
			e.printStackTrace();
		}

		return message;
	}

	// 메일 전송 및 인증번호 저장
	public void sendMail(String email) {
		int number = createNumber();
		verificationMap.put(email, number);
		MimeMessage message = createMail(email, number);
		javaMailSender.send(message);
	}

	// 인증번호 조회
	public boolean verifyCode(String email, String inputCode) {
		Integer storedCode = verificationMap.get(email); // 저장된 인증번호 가져오기
		return storedCode != null && storedCode.toString().equals(inputCode);
	}
}