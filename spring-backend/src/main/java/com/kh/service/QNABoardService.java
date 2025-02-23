package com.kh.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.dto.QNABoardDTO;
import com.kh.mapper.QNABoardMapper;

@Service
public class QNABoardService {
    @Autowired
    private QNABoardMapper mapper;

    public QNABoardService(QNABoardMapper mapper) {
        this.mapper = mapper;
    }

    public List<QNABoardDTO> selectQnaBoards(int classNumber) {
        return mapper.selectQnaBoards(classNumber);
    }

    public boolean writeQna(QNABoardDTO qnaBoardDTO) {
        // 자동 증가된 공지 번호 가져오기
        int askNumber = mapper.selectNextAskNumber();
        
        // 공지 번호를 DTO에 설정
        qnaBoardDTO.setAskNumber(askNumber);

        // 공지사항 등록
        int result = mapper.insertAsk(qnaBoardDTO);
        
        return result > 0;
    }

    public boolean updateAsk(QNABoardDTO qnaBoardDTO) {
        return mapper.updateAsk(qnaBoardDTO) > 0;
    }

    public boolean deleteAsk(int askNumber) {
        return mapper.deleteAsk(askNumber) > 0;
    }

    public List<QNABoardDTO> selectLatestAsks(String uno) {
        return mapper.selectLatestAsks(uno);
    }
    
}