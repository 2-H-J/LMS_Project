package com.kh.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.kh.dto.ChapterDTO;
import com.kh.mapper.ChapterMapper;

@Service
public class ChapterService {

    private final ChapterMapper mapper;

    public ChapterService(ChapterMapper mapper) {
        this.mapper = mapper;
    }

    // 챕터 등록
    public int insertChapter(ChapterDTO chapter) {
        int chapterNumber = mapper.selectChapterNo(); // 새로운 챕터 번호 생성
        chapter.setChapterNumber(chapterNumber);
        return mapper.insertChapter(chapter) > 0 ? chapterNumber : -1;
    }

    // 특정 강의의 챕터 목록 조회
    public List<ChapterDTO> selectChapter(int classNumber) {
        return mapper.selectChapter(classNumber);
    }

    public String getChapterName(int chapterNumber) {
        return mapper.getChapterName(chapterNumber);
    }

    // 챕터 수정
    public int updateChapterName(int chapterNumber, String chapterName) {
        return mapper.updateChapterName(chapterNumber, chapterName);
    }

    // 챕터 내 영상 개수 조회
    public int getVideoCount(int chapterNumber) {
        return mapper.getVideoCount(chapterNumber);
    }

    // 챕터 내 퀴즈 개수 조회
    public int getQuizCount(int chapterNumber) {
        return mapper.getQuizCount(chapterNumber);
    }

    // 챕터 삭제
    public int deleteChapter(int chapterNumber) {
        // 먼저 영상 & 퀴즈 삭제
        mapper.deleteVideosByChapter(chapterNumber);
        mapper.deleteQuizzesByChapter(chapterNumber);

        // 마지막으로 챕터 삭제
        return mapper.deleteChapter(chapterNumber);
    }
}
