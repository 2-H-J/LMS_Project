package com.kh.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.kh.dto.ChapterDTO;

@Mapper
public interface ChapterMapper {

    // 특정 강의의 챕터 목록 조회
    List<ChapterDTO> selectChapter(@Param("classNumber") int classNumber);

    // 새 챕터 번호 생성
    int selectChapterNo();

    // 챕터 등록
    int insertChapter(ChapterDTO chapter);

    // 챕터 수정
    int updateChapterName(@Param("chapterNumber") int chapterNumber, @Param("chapterName") String chapterName);

    // 챕터 내 영상 개수 조회
    int getVideoCount(@Param("chapterNumber") int chapterNumber);

    // 챕터 내 퀴즈 개수 조회
    int getQuizCount(@Param("chapterNumber") int chapterNumber);

    // 챕터 내 영상 삭제
    int deleteVideosByChapter(@Param("chapterNumber") int chapterNumber);

    // 챕터 내 퀴즈 삭제
    int deleteQuizzesByChapter(@Param("chapterNumber") int chapterNumber);

    // 챕터 삭제
    int deleteChapter(@Param("chapterNumber") int chapterNumber);

    String getChapterName(int chapterNumber);
}
