package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.NoticeDTO;

@Mapper
public interface NoticeMapper {

    List<NoticeDTO> selectNoticeList(int classNumber);

    int selectNextNoticeNumber();  // 자동 증가된 공지 번호 조회

    int insertNotice(NoticeDTO noticeDTO);  // 공지사항 등록

    boolean deleteNotice(int noticeNumber); // 공지사항 삭제
}