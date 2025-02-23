package com.kh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.dto.NoticeDTO;
import com.kh.service.NoticeService;
import com.kh.token.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestPart;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/class/{classNumber}/notice")
    public List<NoticeDTO> selectNoticeList(@PathVariable int classNumber) {
        List<NoticeDTO> noticeList = noticeService.selectNoticeList(classNumber);
        return noticeList;
    }

    @PostMapping("/class/{classNumber}/notice/write")
    public Map<String, Object> writeNotice(
            @RequestHeader("Authorization") String token,
            @RequestPart("params") String params) {

        Map<String, Object> map = new HashMap<>();

        try {
            token = token != null ? token.replace("Bearer ", "") : null;

            int userGrade = tokenProvider.getRoleFromToken(token);

            System.out.println("사용자 등급: " + userGrade);
            System.out.println(params);

            if (userGrade != 1) {
                map.put("code", 3);
                map.put("msg", "강사만 공지사항 등록이 가능합니다.");
                return map;
            }

            // JSON 데이터를 DTO로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            NoticeDTO noticeDTO = objectMapper.readValue(params, NoticeDTO.class);

            System.out.println(noticeDTO);

            boolean result = noticeService.writeNotice(noticeDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "공지사항이 성공적으로 등록되었습니다.");
            } else {
                map.put("code", 0);
                map.put("msg", "공지사항 등록에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "공지사항 등록 중 오류가 발생했습니다.");
            e.printStackTrace();
        }

        return map;
    }

    @DeleteMapping("/class/{classNumber}/notice/{noticeNumber}")
    public Map<String, Object> deleteNotice(
            @RequestHeader("Authorization") String token,
            @PathVariable int classNumber,
            @PathVariable int noticeNumber) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            // JWT에서 Bearer 제거
            token = token != null ? token.replace("Bearer ", "") : null;
            
            int userGrade = tokenProvider.getRoleFromToken(token); // 사용자 역할 확인
            
            if (userGrade != 1) {
                map.put("code", 3);
                map.put("msg", "강사만 공지사항을 삭제할 수 있습니다.");
                return map;
            }
            
            // 공지사항 삭제 로직 호출
            boolean result = noticeService.deleteNotice(noticeNumber);
            
            if (result) {
                map.put("code", 1);
                map.put("msg", "공지사항이 성공적으로 삭제되었습니다.");
            } else {
                map.put("code", 0);
                map.put("msg", "공지사항 삭제에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "공지사항 삭제 중 오류가 발생했습니다.");
            e.printStackTrace();
        }

        return map;
    }

}