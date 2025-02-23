package com.kh.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.kh.dto.VideoDTO;
import com.kh.service.VideoService;
import com.kh.service.YouTubeService;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
@RequestMapping("/video")
public class VideoController {

    private final VideoService videoService;

    // 유튜브 영상 등록
    @PostMapping("/insert")
    public Map<String, Object> insertVideo(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();

        String videoUrl = requestData.get("videoUrl"); // 유튜브 URL
        String videoTitle = requestData.get("videoTitle"); // 영상 제목
        int chapterNumber;
        int classNumber;

        try {
            chapterNumber = Integer.parseInt(requestData.get("chapterNumber"));
            classNumber = Integer.parseInt(requestData.get("classNumber"));
        } catch (NumberFormatException e) {
            response.put("code", 0);
            response.put("message", "Invalid chapter number or class number");
            return response;
        }

        boolean success = videoService.insertVideo(classNumber, chapterNumber, videoTitle, videoUrl);
        response.put("code", success ? 1 : 0);
        response.put("message", success ? "영상 등록 성공" : "영상 등록 실패 (잘못된 유튜브 URL 또는 영상 길이 오류)");

        return response;
    }

    // 특정 영상 조회
    @GetMapping("/{videoNumber}")
    public Map<String, Object> getVideo(@PathVariable int videoNumber) {
        Map<String, Object> response = new HashMap<>();

        VideoDTO video = videoService.getVideoByNumber(videoNumber);
        if (video == null) {
            response.put("code", 0);
            response.put("message", "해당 videoNumber에 대한 영상 없음");
            return response;
        }

        response.put("video", video);
        response.put("classTitle", video.getClassTitle() != null ? video.getClassTitle() : "강의 정보 없음");
        response.put("chapterTitle", video.getChapterTitle() != null ? video.getChapterTitle() : "챕터 정보 없음");
        response.put("code", 1);
        response.put("message", "영상 조회 성공");

        return response;
    }

    // 이전/다음 영상 조회
    @GetMapping("/{videoNumber}/navigation/{classNumber}")
    public Map<String, Object> getPrevNextVideo(@PathVariable int videoNumber, @PathVariable int classNumber) {
        return videoService.getPrevNextVideo(videoNumber, classNumber);
    }

    // 유튜브 URL에서 영상ID, 길이조회
    @PostMapping("/urlChange")
    public Map<String, Object> extractVideoData(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        String videoUrl = requestData.get("videoUrl");

        if (videoUrl == null || videoUrl.trim().isEmpty()) {
            response.put("code", 0);
            response.put("message", "유효하지 않은 유튜브 URL");
            return response;
        }

        // YouTubeService를 통해 영상 정보 가져오기
        YouTubeService.VideoData videoData = videoService.extractVideoData(videoUrl);
        if (videoData == null) {
            response.put("code", 0);
            response.put("message", "유효하지 않은 유튜브 URL 또는 조회 실패");
        } else {
            response.put("code", 1);
            response.put("message", "영상 정보 조회 성공");
            response.put("videoData", videoData);
        }

        return response;
    }

    // 영상 수정
    @PutMapping("/update/{videoNumber}")
    public Map<String, Object> updateVideo(
            @PathVariable int videoNumber,
            @RequestBody Map<String, String> requestData) {

        // 클라이언트에서 전달받은 데이터
        String videoTitle = requestData.get("videoTitle");
        String videoId = requestData.get("videoId"); // 변경된 유튜브 ID
        String videoDurationStr = requestData.get("videoDuration");

        // 영상 길이 (숫자로 변환)
        Integer videoDuration = videoDurationStr != null ? Integer.parseInt(videoDurationStr) : null;

        // 서비스 계층 호출하여 업데이트 수행
        boolean success = videoService.updateVideo(videoNumber, videoTitle, videoId, videoDuration);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("code", success ? 1 : 0);
        response.put("message", success ? "영상 수정 성공" : "영상 수정 실패");

        return response;
    }

    // 영상 삭제
    @DeleteMapping("/delete/{videoNumber}")
    public Map<String, Object> deleteVideo(@PathVariable int videoNumber) {
        // 서비스 계층 호출하여 삭제 수행
        boolean success = videoService.deleteVideo(videoNumber);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("code", success ? 1 : 0);
        response.put("message", success ? "영상 삭제 성공" : "영상 삭제 실패");

        return response;
    }
}
