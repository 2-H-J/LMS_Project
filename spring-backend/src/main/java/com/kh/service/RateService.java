package com.kh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.dto.RateDTO;
import com.kh.mapper.RateMapper;

@Service
public class RateService {
    private final RateMapper mapper;

    public RateService(RateMapper mapper) {
        this.mapper = mapper;
    }

    public List<RateDTO> selectRateList(int classNumber) {
        return mapper.selectRateList(classNumber);
    }


     // 수강평 등록 + 평균 평점 업데이트
     public boolean insertRate(RateDTO rateDTO) {
        int count = mapper.insertRate(rateDTO);
        if (count > 0) {
            int rate = mapper.selectAverageRate(rateDTO.getClassNumber()); 
            mapper.updateClassRate(rateDTO.getClassNumber(), rate);
        }
        return count > 0;
    }

    // 수강평 수정 + 평균 평점 업데이트
    public boolean updateRate(RateDTO rateDTO) {
        int count = mapper.updateRate(rateDTO);
        if (count > 0) {
            int rate = mapper.selectAverageRate(rateDTO.getClassNumber());
            mapper.updateClassRate(rateDTO.getClassNumber(), rate); 
        }
        return count > 0;
    }

    // 수강평 삭제 + 평균 평점 업데이트
    public boolean deleteRate(RateDTO rateDTO) {
        int count = mapper.deleteRate(rateDTO);
        if (count > 0) {
            int rate = mapper.selectAverageRate(rateDTO.getClassNumber()); 
            mapper.updateClassRate(rateDTO.getClassNumber(), rate); 
        }
        return count > 0;
    }

    // 특정 강의의 평균 평점 조회
    public int getRate(int classNumber) {
        return mapper.selectAverageRate(classNumber);
    }
}