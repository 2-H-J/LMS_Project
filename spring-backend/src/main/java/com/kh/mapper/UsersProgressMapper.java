package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.dto.UsersProgressDTO;

@Mapper
public interface UsersProgressMapper {

    int checkProgress(@Param("uno") String uno, @Param("classNumber") int classNumber);

    int applicationInsert(@Param("uno") String uno, @Param("classNumber") int classNumber);

    int cancelProgress(@Param("uno") String uno, @Param("classNumber") int classNumber);

    List<UsersProgressDTO> selectRecentClasses(String uno);
}
