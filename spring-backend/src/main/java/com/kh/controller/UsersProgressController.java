package com.kh.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.kh.service.UsersProgressService;
import com.kh.token.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/usersProgress")
@RequiredArgsConstructor
public class UsersProgressController {

    private final UsersProgressService usersProgressService;
    private final JwtTokenProvider tokenProvider;

    // 사용자의 특정 강의 수강 여부 확인
    @GetMapping("/check")
    public Map<String, Object> checkProgress(
            @RequestHeader("Authorization") String token,
            @RequestParam("classNumber") int classNumber) {

        token = token.replace("Bearer ", "");
        String uno = tokenProvider.getUserNumberFromToken(token);

        boolean isEnrolled = usersProgressService.checkProgress(uno, classNumber);

        Map<String, Object> response = new HashMap<>();
        response.put("isEnrolled", isEnrolled);
        return response;
    }

    // 강의 수강 신청
    @PostMapping("/application")
    public Map<String, Object> applicationInsert(
            @RequestHeader("Authorization") String token,
            @RequestParam("classNumber") int classNumber) {

        token = token.replace("Bearer ", "");
        String uno = tokenProvider.getUserNumberFromToken(token);

        int result = usersProgressService.applicationInsert(uno, classNumber);

        Map<String, Object> response = new HashMap<>();
        response.put("code", result);
        response.put("msg", result == 1 ? "수강 신청 완료" : "수강 신청 실패");
        return response;
    }

    // 강의 수강 취소
    @DeleteMapping("/cancel")
    public Map<String, Object> cancelProgress(
            @RequestHeader("Authorization") String token,
            @RequestParam("classNumber") int classNumber) {

        token = token.replace("Bearer ", "");
        String uno = tokenProvider.getUserNumberFromToken(token);

        int result = usersProgressService.cancelProgress(uno, classNumber);

        Map<String, Object> response = new HashMap<>();
        response.put("code", result);
        response.put("msg", result == 1 ? "수강 취소 완료" : "수강 취소 실패");
        return response;
    }
}
