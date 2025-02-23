package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.dto.RateDTO;

@Mapper
public interface RateMapper {

    List<RateDTO> selectRateList(int classNumber);

    int insertRate(RateDTO rateDTO);

    int updateRate(RateDTO rateDTO);

    int deleteRate(RateDTO rateDTO);
    
    // 평균 평점 조회
    int selectAverageRate(int classNumber);

    // 강의의 평균 평점을 class 테이블의 rate 컬럼에 업데이트
    int updateClassRate(@Param("classNumber") int classNumber, @Param("rate") int rate);
}