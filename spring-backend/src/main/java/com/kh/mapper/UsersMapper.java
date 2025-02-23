package com.kh.mapper;

import java.util.HashMap;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.UsersDTO;

@Mapper
public interface UsersMapper {

	UsersDTO findUserByIdAndPassword(Map<String, String> map);

	int insertUser(UsersDTO dto);

	int checkIdExists(String id);

	int checkNickNameExists(String nickname);

	int checkUsersNickname(String nickname);

	int checkKakaoNickname(String nickname);

	UsersDTO findUserByUno(String string);

	UsersDTO updateUser(UsersDTO user);

	int updateprofileimg(UsersDTO user);

	int checkEmail(String email);

	UsersDTO findUserByEmail(String email);

	int updatePassword(Map<String, Object> map);

	int updateUserInfo(HashMap<String, Object> map);

	int deleteUno(String uno);

	int checkUser(HashMap<String, Object> map);

}