package com.kh.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.kh.dto.QNACommentDTO;


@Mapper
public interface QNACommentMapper {

    List<QNACommentDTO> selectComments(int askNumber);

    int selectNextCommentNumber();

    int insertComment(QNACommentDTO commentDTO);

    String getUserNameByUno(String uno);

    int deleteComment(int commentNumber);

} 