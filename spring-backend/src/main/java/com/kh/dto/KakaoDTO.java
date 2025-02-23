package com.kh.dto;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class KakaoDTO {
    private String uno;
    private String kakaoId;
    private String name;
    private String nickname;
    private String email;
    private String phone;
    private int grade;
    
	public KakaoDTO(String kakaoId, String name, String nickname, String email, String phone, int grade) {
		this.kakaoId = kakaoId;
		this.name = name;
		this.nickname = nickname;
		this.email = email;
		this.phone = phone;
		this.grade = grade;
	}
   
}