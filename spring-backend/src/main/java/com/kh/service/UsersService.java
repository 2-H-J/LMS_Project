package com.kh.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kh.dto.KakaoDTO;
import com.kh.dto.UsersDTO;
import com.kh.mapper.UsersMapper;

@Service
public class UsersService {
	private UsersMapper mapper;

	public UsersService(UsersMapper mapper) {
		this.mapper = mapper;
	}

	public UsersDTO login(String id, String passwd) {
		try {
			Map<String, String> map = new HashMap<String, String>();
			map.put("id", id);
			map.put("password", passwd);
			return mapper.findUserByIdAndPassword(map);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public int insertUser(UsersDTO dto) {
		return mapper.insertUser(dto);
	}

	public boolean checkIdExists(String id) {
		int count = mapper.checkIdExists(id);
		return count > 0;
	}

	public boolean checkNickNameExists(String nickname) {
		int count = mapper.checkNickNameExists(nickname);
		return count > 0;
	}

	public UsersDTO findUserByUno(String string) {
		return mapper.findUserByUno(string);
	}

	public UsersDTO updateUser(UsersDTO user) {
		return mapper.updateUser(user);
	}

	public int updateprofileimg(UsersDTO user) {
		return mapper.updateprofileimg(user);
	}

	public int checkEmail(String email) {
		return mapper.checkEmail(email);
	}

	public UsersDTO findUserByEmail(String email) {
		return mapper.findUserByEmail(email);
	}

	public int findPassword(String uno, String pwd) {
		Map<String, Object> map = new HashMap<>();
		map.put("uno", uno);
		map.put("password", pwd);
		return mapper.updatePassword(map);
	}

	public int updateUserInfo(HashMap<String , Object> map) {
		return mapper.updateUserInfo(map);
	}

	public int deleteUno(String uno) {
		return mapper.deleteUno(uno);
	}

	public int checkUser(HashMap<String, Object> map) {
		return mapper.checkUser(map);
	}

    public int updatePassword(Map<String,Object> map) {
		return mapper.updatePassword(map);
    }

}