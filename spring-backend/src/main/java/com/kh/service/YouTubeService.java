package com.kh.service;

import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.Video;
import com.google.api.services.youtube.model.VideoListResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YouTubeService {

    @Value("${youtube.api.key}")
    private String apiKey;

    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final YouTube youtube = new YouTube.Builder(
            new NetHttpTransport(),
            JSON_FACTORY,
            (HttpRequestInitializer) request -> {
            }).setApplicationName("LMS-Project").build();

    // 유튜브 URL에서 영상 ID 가져오기
    public String extractVideoId(String url) {
        String[] patterns = {
                "(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/watch\\?v=([a-zA-Z0-9_-]+)",
                "(?:https?:\\/\\/)?(?:www\\.)?youtu\\.be\\/([a-zA-Z0-9_-]+)",
                "(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/shorts\\/([a-zA-Z0-9_-]+)"
        };

        for (String pattern : patterns) {
            Matcher matcher = Pattern.compile(pattern).matcher(url);
            if (matcher.find()) {
                return matcher.group(1);
            }
        }
        return null;
    }

    // 유튜브 API를 사용해 영상 ID와 길이 가져오기
    public VideoData getVideoData(String url) {
        String videoId = extractVideoId(url);
        if (videoId == null)
            return null;

        try {
            YouTube.Videos.List request = youtube.videos()
                    .list(Collections.singletonList("contentDetails"))
                    .setKey(apiKey)
                    .setId(Collections.singletonList(videoId));

            VideoListResponse response = request.execute();
            List<Video> videos = response.getItems();

            if (videos.isEmpty())
                return null;

            String durationStr = videos.get(0).getContentDetails().getDuration();
            int duration = parseDuration(durationStr);

            return new VideoData(videoId, duration);
        } catch (IOException e) {
            return null;
        }
    }

    public int getVideoDurationForProgress(int videoNumber) {
        try {
            YouTube.Videos.List request = youtube.videos()
                    .list(Collections.singletonList("contentDetails"))
                    .setKey(apiKey)
                    .setId(Collections.singletonList(String.valueOf(videoNumber)));
    
            VideoListResponse response = request.execute();
            List<Video> videos = response.getItems();
    
            if (videos.isEmpty())
                return 0;
    
            String durationStr = videos.get(0).getContentDetails().getDuration();
            return parseDuration(durationStr);
        } catch (IOException e) {
            return 0;
        }
    }

    // ISO 8601 형식의 시간을 초 단위로 변환
    private int parseDuration(String duration) {
        Pattern pattern = Pattern.compile("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?");
        Matcher matcher = pattern.matcher(duration);
        int hours = 0, minutes = 0, seconds = 0;

        if (matcher.matches()) {
            if (matcher.group(1) != null)
                hours = Integer.parseInt(matcher.group(1));
            if (matcher.group(2) != null)
                minutes = Integer.parseInt(matcher.group(2));
            if (matcher.group(3) != null)
                seconds = Integer.parseInt(matcher.group(3));
        }
        return hours * 3600 + minutes * 60 + seconds;
    }

    // 영상 정보를 담는 DTO 클래스
    public static class VideoData {
        private final String id;
        private final int length;

        public VideoData(String id, int length) {
            this.id = id;
            this.length = length;
        }

        public String getId() {
            return id;
        }

        public int getLength() {
            return length;
        }
    }
}
