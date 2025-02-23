package com.kh.service;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.dto.KakaoDTO;
import com.kh.mapper.KakaoMapper;

@Service
public class KakaoService {
	@Autowired
	private KakaoMapper mapper;

	public int checkKakaoId(String kakaoId) {
		return mapper.checkKakaoId(kakaoId);
	}

	public KakaoDTO kakaoLogin(String kakaoId) {
		return mapper.kakaoLogin(kakaoId);
	}

	public int insertKakaoUser(KakaoDTO dto) {
		return mapper.insertKakaoUser(dto);
	}


	public int updateKakaoInfo(HashMap<String, Object> map) {
		return mapper.updateKakaoInfo(map);
	}

	public KakaoDTO findKakaoByUno(String uno) {
		return mapper.findKakaoByUno(uno);
	}
}