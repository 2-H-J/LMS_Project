package com.kh.controller;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.kh.dto.VideoProgressDTO;
import com.kh.service.VideoProgressService;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/videoProgress")
@RequiredArgsConstructor
public class VideoProgressController {
    private final VideoProgressService videoProgressService;

    // 시청 기록 생성 (영상 시작 시 호출)
    @PostMapping("/start")
    public Map<String, Object> startVideoProgress(@RequestBody VideoProgressDTO videoProgressDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isUpdated = videoProgressService.startVideoProgress(videoProgressDTO);
            response.put("code", 1);
            response.put("message", isUpdated ? "영상 시청 기록이 업데이트되었습니다." : "새로운 영상 시청 기록이 생성되었습니다.");
        } catch (Exception e) {
            response.put("code", 0);
            response.put("message", "영상 시청 기록 저장 중 오류 발생");
        }
        return response;
    }

    // 시청 기록 업데이트 (영상 보는 중 자동 저장)
    @PutMapping("/update")
    public Map<String, Object> updateVideoProgress(@RequestBody VideoProgressDTO videoProgressDTO) {
        Map<String, Object> response = new HashMap<>();

        boolean isUpdated = videoProgressService.updateVideoProgress(videoProgressDTO);

        response.put("code", 1);
        response.put("message", isUpdated ? "영상 시청 기록이 업데이트되었습니다." : "업데이트 실패");
        return response;
    }

    @GetMapping("/{uno}/{videoNumber}")
    public Map<String, Object> getVideoProgress(@PathVariable String uno, @PathVariable int videoNumber) {
        Map<String, Object> response = new HashMap<>();

        VideoProgressDTO progress = videoProgressService.getVideoProgress(uno, videoNumber);
        if (progress != null) {
            response.put("code", 1);
            response.put("progress", progress);
        } else {
            response.put("code", 0);
            response.put("message", "시청 기록이 존재하지 않습니다.");
        }

        return response;
    }

    // 최근 시청한 영상 목록 조회 추가
    @GetMapping("/recent/{uno}")
    public Map<String, Object> getRecentWatchedVideos(@PathVariable String uno) {
        Map<String, Object> response = new HashMap<>();
        List<VideoProgressDTO> recentVideos = videoProgressService.getRecentWatchedVideos(uno);

        if (!recentVideos.isEmpty()) {
            response.put("code", 1);
            response.put("recentVideos", recentVideos);
        } else {
            response.put("code", 0);
            response.put("message", "최근 시청한 영상이 없습니다.");
        }

        return response;
    }

}