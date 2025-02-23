package com.kh.mapper;

import java.util.HashMap;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.KakaoDTO;

@Mapper
public interface KakaoMapper {

	int checkKakaoId(String kakaoId);

	KakaoDTO kakaoLogin(String kakaoId);

	int insertKakaoUser(KakaoDTO dto);

	int updateKakaoInfo(HashMap<String, Object> map);

	KakaoDTO findKakaoByUno(String uno);
}