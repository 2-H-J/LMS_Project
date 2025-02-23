package com.kh.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.dto.NoticeDTO;
import com.kh.mapper.NoticeMapper;

import lombok.RequiredArgsConstructor;


@Service
public class NoticeService {
    @Autowired
    private NoticeMapper mapper;

    public NoticeService(NoticeMapper mapper) {
        this.mapper = mapper;
    }

    public List<NoticeDTO> selectNoticeList(int classNumber) {
        return mapper.selectNoticeList(classNumber);
    }

    public boolean writeNotice(NoticeDTO noticeDTO) {
        // 자동 증가된 공지 번호 가져오기
        int noticeNumber = mapper.selectNextNoticeNumber();
        
        // 공지 번호를 DTO에 설정
        noticeDTO.setNoticeNumber(noticeNumber);

        // 공지사항 등록
        int result = mapper.insertNotice(noticeDTO);
        
        return result > 0;
}

    public boolean deleteNotice(int noticeNumber) {
        return mapper.deleteNotice(noticeNumber);
    }

    
}