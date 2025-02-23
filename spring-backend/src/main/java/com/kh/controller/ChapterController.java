package com.kh.controller;

import com.kh.service.ChapterService;
import com.kh.token.JwtTokenProvider;
import com.kh.dto.ChapterDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
@RequestMapping("/chapter")
public class ChapterController {

    private final ChapterService chapterService;
    private final JwtTokenProvider tokenProvider;

    // 챕터 추가
    @PostMapping("/insert/{classNumber}")
    public Map<String, Object> insertChapter(
            @RequestHeader("Authorization") String token,
            @PathVariable int classNumber, // URL에서 classNumber
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();
        System.out.println("받은 챕터 요청 데이터: " + request);

        try {
            token = token != null ? token.replace("Bearer ", "") : null;
            int userGrade = tokenProvider.getRoleFromToken(token);

            if (userGrade != 1) {
                response.put("code", 3);
                response.put("msg", "강사만 챕터를 등록할 수 있습니다.");
                return response;
            }

            String chapterName = request.get("chapterName");
            if (chapterName == null || chapterName.trim().isEmpty()) {
                response.put("code", 2);
                response.put("msg", "잘못된 요청 데이터 (챕터명 없음)");
                return response;
            }

            ChapterDTO chapterDTO = new ChapterDTO();
            chapterDTO.setChapterName(chapterName);
            chapterDTO.setClassNumber(classNumber); // URL에서 classNumber 받은 값

            int chapterNumber = chapterService.insertChapter(chapterDTO);
            if (chapterNumber > 0) {
                response.put("code", 1);
                response.put("msg", "챕터 등록 성공");
                response.put("chapterNumber", chapterNumber);
            } else {
                response.put("code", 2);
                response.put("msg", "챕터 등록 실패");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", 2);
            response.put("msg", "챕터 등록 중 오류 발생");
        }

        return response;
    }

    // 챕터 수정
    @PutMapping("/update/{chapterNumber}")
    public Map<String, Object> updateChapterName(
            @RequestHeader("Authorization") String token,
            @PathVariable int chapterNumber,
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();
        System.out.println("받은 챕터 수정 요청 데이터: " + request);

        try {
            token = token != null ? token.replace("Bearer ", "") : null;
            int userGrade = tokenProvider.getRoleFromToken(token);

            if (userGrade != 1) {
                response.put("code", 3);
                response.put("msg", "강사만 챕터를 수정할 수 있습니다.");
                return response;
            }

            String chapterName = request.get("chapterName");
            if (chapterName == null || chapterName.trim().isEmpty()) {
                response.put("code", 2);
                response.put("msg", "잘못된 요청 데이터 (챕터명 없음)");
                return response;
            }

            int result = chapterService.updateChapterName(chapterNumber, chapterName);
            if (result > 0) {
                response.put("code", 1);
                response.put("msg", "챕터 수정 성공");
            } else {
                response.put("code", 2);
                response.put("msg", "챕터 수정 실패");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", 2);
            response.put("msg", "챕터 수정 중 오류 발생");
        }

        return response;
    }

        // 챕터 삭제
        @DeleteMapping("/delete/{chapterNumber}")
        public Map<String, Object> deleteChapter(
                @RequestHeader("Authorization") String token,
                @PathVariable int chapterNumber) {
    
            Map<String, Object> response = new HashMap<>();
    
            try {
                token = token != null ? token.replace("Bearer ", "") : null;
                int userGrade = tokenProvider.getRoleFromToken(token);
    
                if (userGrade != 1) {
                    response.put("code", 3);
                    response.put("msg", "강사만 챕터를 삭제할 수 있습니다.");
                    return response;
                }
    
                int videoCount = chapterService.getVideoCount(chapterNumber);
                int quizCount = chapterService.getQuizCount(chapterNumber);
    
                // 챕터 삭제 수행
                int result = chapterService.deleteChapter(chapterNumber);
                if (result > 0) {
                    response.put("code", 1);
                    response.put("msg", videoCount > 0
                            ? videoCount + "개의 영상과 " + quizCount + "개의 퀴즈가 삭제되었습니다."
                            : "챕터가 삭제되었습니다.");
                } else {
                    response.put("code", 2);
                    response.put("msg", "챕터 삭제 실패");
                }
    
            } catch (Exception e) {
                e.printStackTrace();
                response.put("code", 2);
                response.put("msg", "챕터 삭제 중 오류 발생");
            }
    
            return response;
        }

}
