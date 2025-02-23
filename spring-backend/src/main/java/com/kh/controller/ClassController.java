package com.kh.controller;

import com.kh.service.ChapterService;
import com.kh.service.ClassService;
import com.kh.service.QuizService;
import com.kh.service.RateService;
import com.kh.service.VideoService;
import com.kh.token.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.dto.ChapterDTO;
import com.kh.dto.ClassDTO;
import com.kh.dto.VideoDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
@RequestMapping("/class")
public class ClassController {

    private final ClassService classService;
    private final ChapterService chapterService;
    private final VideoService videoService;
    private final QuizService quizService;
    private final RateService rateService;
    private final JwtTokenProvider tokenProvider;

    // 강의 목록 조회
    @GetMapping("/list")
    public List<ClassDTO> selectClassList(
            @RequestParam(required = false, defaultValue = "전체") String category,
            @RequestParam(required = false, defaultValue = "최신순") String sort) {
        return classService.selectClassList(category, sort);
    }

    // 강의 검색 API
    @GetMapping("/search")
    public Map<String, Object> searchClasses(
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false, defaultValue = "전체") String category,
            @RequestParam(required = false, defaultValue = "최신순") String sort) {

        Map<String, Object> map = new HashMap<>();
        try {
            List<ClassDTO> classList = classService.searchClasses(searchKeyword, category, sort);
            System.out.println("검색 요청 - 키워드: " + searchKeyword + ", 카테고리: " + category + ", 정렬: " + sort);
            map.put("classList", classList);
            map.put("code", 1);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("code", 2);
            map.put("msg", "강의 검색 실패");
        }
        return map;
    }

    // 썸네일 제공
    @GetMapping("/thumbnail/{classNumber}")
    public ResponseEntity<Map<String, Object>> getThumbnail(@PathVariable int classNumber) {
        Map<String, Object> response = new HashMap<>();
        try {
            // DB에서 강의 정보 가져오기
            ClassDTO classDTO = classService.selectClass(classNumber);

            if (classDTO != null && classDTO.getThumbnail() != null) {
                response.put("thumbnail", classDTO.getThumbnail());
                return ResponseEntity.ok(response);
            } else {
                response.put("msg", "썸네일이 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("msg", "썸네일 조회 실패");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 강의 등록
    @PostMapping("/write")
    public Map<String, Object> classWrite(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> requestData) { // Base64 방식으로 수정

        Map<String, Object> map = new HashMap<>();
        try {
            token = token.replace("Bearer ", "");
            int userGrade = tokenProvider.getRoleFromToken(token);

            if (userGrade != 1) {
                map.put("code", 3);
                map.put("msg", "강사만 강의 등록이 가능합니다.");
                return map;
            }

            ObjectMapper objectMapper = new ObjectMapper();
            ClassDTO classDTO = objectMapper.convertValue(requestData, ClassDTO.class);

            // Base64 썸네일 처리
            String base64Thumbnail = (String) requestData.get("thumbnail");
            if (base64Thumbnail != null && !base64Thumbnail.isEmpty()) {
                classDTO.setThumbnail(base64Thumbnail);
            }

            int classNumber = classService.insertClass(classDTO);
            map.put("classNumber", classNumber);
            map.put("thumbnail", classDTO.getThumbnail());
            map.put("code", 1);
            map.put("msg", "강의 등록 성공");

        } catch (Exception e) {
            e.printStackTrace();
            map.put("code", 2);
            map.put("msg", "강의 등록 실패");
        }
        return map;
    }

    // 강의 상세 조회
    @GetMapping("/{classNumber}")
    public Map<String, Object> classView(@PathVariable int classNumber) {
        Map<String, Object> map = new HashMap<>();
        ClassDTO classDTO = classService.selectClass(classNumber);
        List<ChapterDTO> chapters = chapterService.selectChapter(classNumber);

        if (chapters == null) {
            chapters = new ArrayList<>();
        }

        Map<Integer, List<VideoDTO>> videoMap = new HashMap<>();

        for (ChapterDTO chapter : chapters) {
            int chapterNumber = chapter.getChapterNumber();
            List<VideoDTO> videos = videoService.selectVideo(chapterNumber);
            videoMap.put(chapterNumber, videos);
        }
        // 평균 평점 조회
        int rate = rateService.getRate(classNumber);

        map.put("class", classDTO);
        map.put("chapter", chapters);
        map.put("video", videoMap);
        map.put("rate", rate);

        return map;
    }

    // 강의 수정
    @PostMapping("/update")
    public Map<String, Object> classUpdate(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> requestBody) {

        Map<String, Object> map = new HashMap<>();
        try {
            token = token.replace("Bearer ", "");
            int userGrade = tokenProvider.getRoleFromToken(token);

            if (userGrade != 1) {
                map.put("code", 3);
                map.put("msg", "강사만 강의를 수정할 수 있습니다.");
                return map;
            }

            // //JSON에서 필요한 정보 추출
            int classNumber = (int) requestBody.get("classNumber");
            String title = (String) requestBody.get("title");
            String description = (String) requestBody.get("description");
            String category = (String) requestBody.get("category");
            String base64Thumbnail = (String) requestBody.get("thumbnail"); // Base64 문자열

            // //기존 강의 정보 조회
            ClassDTO dto = classService.selectClass(classNumber);
            dto.setTitle(title);
            dto.setDescription(description);
            dto.setCategory(category);

            // //Base64 썸네일이 있을 경우 업데이트
            if (base64Thumbnail != null && !base64Thumbnail.isEmpty()) {
                dto.setThumbnail(base64Thumbnail);
            }

            // //강의 정보 업데이트
            classService.updateClass(dto);
            map.put("code", 1);
            map.put("msg", "강의 수정 성공");

        } catch (Exception e) {
            e.printStackTrace();
            map.put("code", 2);
            map.put("msg", "강의 수정 실패");
        }
        return map;
    }

    // 강의 삭제
    @DeleteMapping("/{classNumber}")
    public Map<String, Object> classDelete(@RequestHeader("Authorization") String token,
            @PathVariable int classNumber) {
        Map<String, Object> map = new HashMap<>();

        try {
            token = token.replace("Bearer ", "");
            String userNumber = tokenProvider.getUserNumberFromToken(token);
            String classOwner = classService.selectClass(classNumber).getUno();

            if (userNumber.equals(classOwner)) {
                classService.deleteClass(classNumber);
                map.put("code", 1);
                map.put("msg", "강의 삭제 완료");
            } else {
                map.put("code", 2);
                map.put("msg", "삭제 권한이 없습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            map.put("code", 3);
            map.put("msg", "강의 삭제 중 오류 발생");
        }

        return map;
    }
}
