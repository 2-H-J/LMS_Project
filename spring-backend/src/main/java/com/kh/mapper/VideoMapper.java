package com.kh.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.dto.VideoDTO;
import java.util.List;
import java.util.Map;

@Mapper
public interface VideoMapper {

    // 해당 챕터의 영상 목록 조회
    List<VideoDTO> selectVideo(int chapterNumber);

    // 유튜브 영상 정보 DB에 저장
    int insertVideo(VideoDTO video);

    // videoNumber로 영상 조회
    VideoDTO getVideoByNumber(int videoNumber);

    // 같은 강의 내에서 현재 영상 기준 이전 영상 찾기
    Integer getPrevVideo(Map<String, Object> params);

    // 같은 강의 내에서 현재 영상 기준 다음 영상 찾기
    Integer getNextVideo(Map<String, Object> params);

    // 영상 수정
    int updateVideo(@Param("videoNumber") int videoNumber,
            @Param("videoTitle") String videoTitle,
            @Param("videoId") String videoId,
            @Param("videoDuration") Integer videoDuration);

    // 영상 삭제
    int deleteVideo(@Param("videoNumber") int videoNumber);
}
