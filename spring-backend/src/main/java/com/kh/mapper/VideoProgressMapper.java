package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.dto.VideoProgressDTO;

@Mapper
public interface VideoProgressMapper {
    // 특정 유저의 특정 영상 시청 기록 조회
    VideoProgressDTO findProgressByUserAndVideo(@Param("uno") String uno, @Param("videoNumber") int videoNumber);

    // 새로운 시청 기록 추가
    void insertProgress(VideoProgressDTO videoProgressDTO);

    // 기존 시청 기록 업데이트
    void updateProgress(VideoProgressDTO videoProgressDTO);

    // VIDEO 테이블에서 video_duration 가져오기
    Double getVideoDuration(@Param("videoNumber") int videoNumber);

    // 특정 유저의 최근 시청 영상 목록 조회
    List<VideoProgressDTO> findRecentVideosByUser(String uno);

}