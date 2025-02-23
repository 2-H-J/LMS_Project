package com.kh.token;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.kh.dto.KakaoDTO;
import com.kh.dto.UsersDTO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Component
public class JwtTokenProvider {
	// 토큰 유효시간 설정
	private final long expiredTime = 1000L * 60L * 60L * 1L; // 1시간의 유효시간 설정
	private SecretKey key = Jwts.SIG.HS256.key().build();
	
	//일반 유저 토큰 생성
	public String generateJwtToken(UsersDTO member) {
		Date expire = new Date(Calendar.getInstance().getTimeInMillis() + expiredTime);

		return Jwts.builder().header().add(createHeader()).and().setExpiration(expire).setClaims(createClaims(member))
				.subject(member.getUno()).signWith(key).compact();
	}

	private Map<String, Object> createClaims(UsersDTO member) {	
		Map<String, Object> map = new HashMap<>();
		map.put("grade", member.getGrade());
		map.put("nickname", member.getNickname());
		map.put("type", 0);
		return map;
	}
	
	//카카오 유저 토큰 생성
	public String generateKakaoJwtToken(KakaoDTO kakaoUser) {
	    Date expire = new Date(Calendar.getInstance().getTimeInMillis() + expiredTime);

	    return Jwts.builder()
	            .header().add(createHeader()).and()
	            .setExpiration(expire)
	            .setClaims(createKakaoClaims(kakaoUser))  // 카카오 유저용 Claims 설정
	            .subject(kakaoUser.getUno()) // 카카오 유저의 ID 저장
	            .signWith(key)
	            .compact();
	}
	
	private Map<String, Object> createKakaoClaims(KakaoDTO kakaoUser) {
		Map<String, Object> map = new HashMap<>();
		map.put("grade", kakaoUser.getGrade());
		map.put("nickname", kakaoUser.getNickname());
		map.put("type", 1);
		return map;
	}
	
	// 유저 번호
	public String getUserNumberFromToken(String token) {
		return (String) getClaims(token).getSubject();
	}

	// 유저 등급
	public int getRoleFromToken(String token) {
		return (int) getClaims(token).get("grade");
	}
	

	// 유저 닉네임
	public String getNicknameFromToken(String token) {
		return (String) getClaims(token).get("nickname");
	}

	// 유저 타입
	public int getUserTypeFromToken(String token) {
		return (int) getClaims(token).get("type");
	}

	private Claims getClaims(String token) {
		return Jwts.parser().verifyWith(key).build().parseClaimsJws(token).getBody();
	}


	private Map<String, Object> createHeader() {
		Map<String, Object> map = new HashMap<>();
		map.put("typ", "JWT"); // 토큰 종류
		map.put("alg", "HS256"); // 암호화에 사용할 알고리즘
		map.put("regDate", System.currentTimeMillis()); // 생성시간
		return map;
	}
}