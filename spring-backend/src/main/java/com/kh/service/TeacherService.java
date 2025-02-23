package com.kh.service;

import org.springframework.stereotype.Service;

import com.kh.dto.TeacherDTO;
import com.kh.mapper.TeacherMapper;

@Service
public class TeacherService {
	private TeacherMapper mapper;

	public TeacherService(TeacherMapper mapper) {
		this.mapper = mapper;
	}

	public TeacherDTO getTeacherProfile(String uno) {
		return mapper.getTeacherProfile(uno);
	}

	public int saveTeacherProfile(TeacherDTO dto) {
		int exists = mapper.checkTeacherInfo(dto.getUno());
		int count = 0;
		if (exists > 0) {
			count = mapper.updateTeacherProfile(dto);
		} else {
			count = mapper.insertTeacherProfile(dto);
		}
		return count;
	}

}
