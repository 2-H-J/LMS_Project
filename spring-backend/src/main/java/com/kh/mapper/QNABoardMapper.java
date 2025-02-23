package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.QNABoardDTO;


@Mapper
public interface QNABoardMapper {

    List<QNABoardDTO> selectQnaBoards(int classNumber);

    int selectNextAskNumber(); // 자동 증가된 질문 번호 조회

    int insertAsk(QNABoardDTO qnaBoardDTO); // 질문 등록

    int updateAsk(QNABoardDTO qnaBoardDTO); // 질문 수정

    int deleteAsk(int askNumber); // 질문 삭제

    List<QNABoardDTO> selectLatestAsks(String uno); // 최근 질문 조회

} 