package com.kh.service;

import com.kh.dto.VideoDTO;
import com.kh.mapper.VideoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoMapper mapper;
    private final YouTubeService youTubeService;

    // 특정 챕터의 영상 목록 조회
    public List<VideoDTO> selectVideo(int chapterNumber) {
        return mapper.selectVideo(chapterNumber);
    }

    // 특정 영상 정보 조회
    public VideoDTO getVideoByNumber(int videoNumber) {
        return mapper.getVideoByNumber(videoNumber);
    }

    // 유튜브 영상 등록
    public boolean insertVideo(int classNumber, int chapterNumber, String videoTitle, String videoUrl) {
        // YouTubeService 영상 ID 및 길이 가져오기
        YouTubeService.VideoData videoData = youTubeService.getVideoData(videoUrl);
        if (videoData == null) {
            System.err.println("유효하지 않은 유튜브 URL 또는 영상 길이 조회 실패: " + videoUrl);
            return false;
        }

        VideoDTO video = new VideoDTO(
                0, classNumber, chapterNumber, videoTitle,
                videoData.getId(), videoData.getLength(), 0, null);

        return mapper.insertVideo(video) > 0;
    }

    // 이전/다음 영상 조회
    public Map<String, Object> getPrevNextVideo(int videoNumber, int classNumber) {
        Map<String, Object> videoData = new HashMap<>();

        VideoDTO currentVideo = mapper.getVideoByNumber(videoNumber);
        if (currentVideo == null) {
            videoData.put("code", 0);
            videoData.put("message", "해당 videoNumber에 대한 영상 없음");
            return videoData;
        }

        // 현재 영상의 챕터 및 영상 순서 정보 가져오기
        int chapterNumber = currentVideo.getChapterNumber();
        int videoOrderNumber = currentVideo.getVideoOrderNumber();

        // 이전 영상 조회
        Map<String, Object> prevParams = new HashMap<>();
        prevParams.put("videoNumber", videoNumber);
        prevParams.put("classNumber", classNumber);
        prevParams.put("chapterNumber", chapterNumber);
        prevParams.put("videoOrderNumber", videoOrderNumber);
        Integer prevVideoId = mapper.getPrevVideo(prevParams);

        // 다음 영상 조회
        Map<String, Object> nextParams = new HashMap<>();
        nextParams.put("videoNumber", videoNumber);
        nextParams.put("classNumber", classNumber);
        nextParams.put("chapterNumber", chapterNumber);
        nextParams.put("videoOrderNumber", videoOrderNumber);
        Integer nextVideoId = mapper.getNextVideo(nextParams);

        videoData.put("prevVideoId", prevVideoId);
        videoData.put("nextVideoId", nextVideoId);
        videoData.put("code", 1);
        videoData.put("message", "이전/다음 영상 조회 성공");

        return videoData;
    }

    // 유튜브 URL 영상 정보
    public YouTubeService.VideoData extractVideoData(String videoUrl) {
        return youTubeService.getVideoData(videoUrl);
    }

    // 영상 수정
    public boolean updateVideo(int videoNumber, String videoTitle, String videoId, Integer videoDuration) {
        return mapper.updateVideo(videoNumber, videoTitle, videoId, videoDuration) > 0;
    }

    // 영상 삭제
    public boolean deleteVideo(int videoNumber) {
        return mapper.deleteVideo(videoNumber) > 0;
    }
}
