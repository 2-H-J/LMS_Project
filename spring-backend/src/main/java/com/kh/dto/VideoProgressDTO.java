package com.kh.dto;

import java.sql.Timestamp;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class VideoProgressDTO {
    private int videoProgressNumber;
    private String uno;
    private int videoNumber;
    private String videoTitle; 
    private String videoId; 
    private int watchedPercentage; // 영상시청률
    private int lastWatchedTime; // 마지막 시청시간 위치
    private Timestamp videoProgressUpdateTime; // 실시간 업데이트 시간
    private double videoDuration; // 영상 전체 길이
    private int completed; // 영상 시청 여부 (0: 미완료, 1: 완료, 기본값 0)
    private String classTitle;
    private String instructorName;
    private String thumbnail;

}