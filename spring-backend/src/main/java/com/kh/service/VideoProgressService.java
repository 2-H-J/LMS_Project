package com.kh.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.kh.dto.VideoProgressDTO;
import com.kh.mapper.VideoProgressMapper;

import java.sql.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoProgressService {
    private final VideoProgressMapper videoProgressMapper;

    // 영상 시청 기록을 시작 (업데이트 또는 삽입)
    public boolean startVideoProgress(VideoProgressDTO videoProgressDTO) {
        // 기존 시청 기록 확인
        VideoProgressDTO existingProgress = videoProgressMapper.findProgressByUserAndVideo(
                videoProgressDTO.getUno(), videoProgressDTO.getVideoNumber());

        // VIDEO 테이블에서 영상 길이 가져오기
        if (videoProgressDTO.getVideoDuration() <= 0) {
            Double videoLength = videoProgressMapper.getVideoDuration(videoProgressDTO.getVideoNumber());
            if (videoLength != null) {
                videoProgressDTO.setVideoDuration(videoLength);
            }
        }

        if (existingProgress != null) {
            existingProgress.setVideoDuration(videoProgressDTO.getVideoDuration()); // 영상 길이 업데이트
            videoProgressMapper.updateProgress(existingProgress);
            return true; // 업데이트됨
        } else {
            videoProgressMapper.insertProgress(videoProgressDTO);
            return false; // 새로 생성됨
        }
    }

    // 영상 시청 기록 업데이트
    public boolean updateVideoProgress(VideoProgressDTO videoProgressDTO) {
        VideoProgressDTO existingProgress = videoProgressMapper.findProgressByUserAndVideo(
                videoProgressDTO.getUno(), videoProgressDTO.getVideoNumber());

        if (existingProgress != null) {
            // 100% 완료된 상태에서는 더 이상 업데이트하지 않음
            if (existingProgress.getWatchedPercentage() >= 100 && existingProgress.getCompleted() == 1) {
                return false;
            }

            existingProgress.setLastWatchedTime(videoProgressDTO.getLastWatchedTime());
            existingProgress.setWatchedPercentage(videoProgressDTO.getWatchedPercentage());
            existingProgress.setCompleted(videoProgressDTO.getCompleted());
            existingProgress.setVideoProgressUpdateTime(new Timestamp(System.currentTimeMillis()));

            videoProgressMapper.updateProgress(existingProgress);
            return true;
        }
        return false;
    }

    public VideoProgressDTO getVideoProgress(String uno, int videoNumber) {
        return videoProgressMapper.findProgressByUserAndVideo(uno, videoNumber);
    }

    // 최근 시청한 영상 목록 조회 추가
    public List<VideoProgressDTO> getRecentWatchedVideos(String uno) {
        return videoProgressMapper.findRecentVideosByUser(uno);
    }

}