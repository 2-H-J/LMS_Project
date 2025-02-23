package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.dto.ClassDTO;

@Mapper
public interface ClassMapper {

    ClassDTO selectClass(int classNumber);

    List<ClassDTO> selectLatestClasses();

    List<ClassDTO> getAllClasses();
    
    // 강의 목록 조회
    List<ClassDTO> selectClassList(
            @Param("category") String category,
            @Param("sort") String sort
    );
 
    // 강의 검색 (썸네일 포함)
    List<ClassDTO> searchClasses(
            @Param("searchKeyword") String searchKeyword, 
            @Param("category") String category, 
            @Param("sort") String sort
    );

    int selectClassNo(); // 새 강의 번호 생성

    int insertClass(ClassDTO classDTO); // 강의 등록

    int updateClass(ClassDTO dto); // 강의 수정

    int deleteClass(int classNumber);   // 강의 삭제

    List<ClassDTO> selectClassListByUno(String uno); // 강사 강의 목록 조회

}