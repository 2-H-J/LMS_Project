package com.kh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.dto.RateDTO;
import com.kh.service.RateService;
import com.kh.token.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class RateController {
    private final RateService rateService;
    private final JwtTokenProvider tokenProvider;

    // 특정 강의의 수강평 리스트 조회
    @GetMapping("/class/{classNumber}/rate")
    public List<RateDTO> getRateList(@PathVariable int classNumber) {
        return rateService.selectRateList(classNumber);
    }

    // 특정 강의의 평균 평점 조회
    @GetMapping("/class/{classNumber}/rate/average")
    public Map<String, Object> getRate(@PathVariable int classNumber) {
        Map<String, Object> map = new HashMap<>();
        int rate = rateService.getRate(classNumber);
        map.put("rate", rate);
        return map;
    }

    // 수강평 등록 + 평균 평점 업데이트
    @PostMapping("/class/{classNumber}/rate")
    public Map<String, Object> insertRate(
            @RequestHeader("Authorization") String token,
            @RequestPart("params") String params) {
        Map<String, Object> map = new HashMap<>();

        try {
            token = token != null ? token.replace("Bearer ", "") : null;
            String uno = tokenProvider.getUserNumberFromToken(token);

            ObjectMapper objectMapper = new ObjectMapper();
            RateDTO rateDTO = objectMapper.readValue(params, RateDTO.class);
            rateDTO.setUno(uno);
            boolean result = rateService.insertRate(rateDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "수강평이 성공적으로 등록되었습니다.");
                map.put("rate", rateService.getRate(rateDTO.getClassNumber()));
            } else {
                map.put("code", 0);
                map.put("msg", "수강평 등록에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "수강평 등록 중 오류가 발생했습니다.");
            e.printStackTrace();
        }

        return map;
    }

    // 수강평 수정 + 평균 평점 업데이트
    @PutMapping("/class/{classNumber}/rate/{rateNumber}")
    public Map<String, Object> updateRate(
            @RequestHeader("Authorization") String token,
            @PathVariable int classNumber,
            @PathVariable int rateNumber,
            @RequestBody Map<String, String> requestBody) {

        Map<String, Object> map = new HashMap<>();

        try {
            token = token.replace("Bearer ", "");
            String uno = tokenProvider.getUserNumberFromToken(token);
            String rateContent = requestBody.get("rateContent");

            RateDTO rateDTO = new RateDTO();
            rateDTO.setRateNumber(rateNumber);
            rateDTO.setUno(uno);
            rateDTO.setRateContent(rateContent);
            rateDTO.setRateScore(Integer.parseInt(requestBody.get("rateScore")));

            boolean result = rateService.updateRate(rateDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "수강평이 수정되었습니다.");
                map.put("rate", rateService.getRate(classNumber));
                map.put("rateList", rateService.selectRateList(classNumber));
            } else {
                map.put("code", 0);
                map.put("msg", "수강평 수정에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "수강평 수정 중 오류 발생");
            e.printStackTrace();
        }

        return map;
    }

    // 수강평 삭제 + 평균 평점 업데이트
    @DeleteMapping("/class/{classNumber}/rate/{rateNumber}")
    public Map<String, Object> deleteRate(
            @RequestHeader("Authorization") String token,
            @PathVariable int classNumber,
            @PathVariable int rateNumber) {

        Map<String, Object> map = new HashMap<>();

        try {
            token = token.replace("Bearer ", "");
            String uno = tokenProvider.getUserNumberFromToken(token);

            RateDTO rateDTO = new RateDTO();
            rateDTO.setRateNumber(rateNumber);
            rateDTO.setUno(uno);

            boolean result = rateService.deleteRate(rateDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "수강평이 삭제되었습니다.");
                map.put("rate", rateService.getRate(classNumber));
                map.put("rateList", rateService.selectRateList(classNumber));
            } else {
                map.put("code", 0);
                map.put("msg", "수강평 삭제에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "수강평 삭제 중 오류 발생");
            e.printStackTrace();
        }

        return map;
    }
}