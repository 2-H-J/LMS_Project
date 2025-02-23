package com.kh.mapper;


import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.TeacherDTO;


@Mapper
public interface TeacherMapper {

    TeacherDTO getTeacherProfile(String uno);

	int checkTeacherInfo(String uno);

	int updateTeacherProfile(TeacherDTO dto);

	int insertTeacherProfile(TeacherDTO dto);

}
