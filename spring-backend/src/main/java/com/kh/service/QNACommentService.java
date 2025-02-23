package com.kh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.dto.QNACommentDTO;
import com.kh.mapper.QNACommentMapper;

@Service
public class QNACommentService {
    private final QNACommentMapper mapper;

    public QNACommentService(QNACommentMapper mapper) {
        this.mapper = mapper;
    }

    public List<QNACommentDTO> selectComments(int askNumber) {
        return mapper.selectComments(askNumber);
    }

    public boolean addComment(QNACommentDTO commentDTO) {
        int commentNumber = mapper.selectNextCommentNumber();
        
        commentDTO.setCommentNumber(commentNumber);

        int result = mapper.insertComment(commentDTO);
        
        return result > 0;
    }

    public String getUserNameByUno(String uno) {
        return mapper.getUserNameByUno(uno);
    }

    public boolean deleteComment(int commentNumber) {
        return mapper.deleteComment(commentNumber) > 0;
    }
}