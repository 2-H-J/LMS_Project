package com.kh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.dto.QNABoardDTO;
import com.kh.dto.QNACommentDTO;
import com.kh.service.QNABoardService;
import com.kh.service.QNACommentService;
import com.kh.token.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class QNAController {
    private final QNABoardService qnaBoardService;
    private final QNACommentService qnaCommentService;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/class/{classNumber}/qna")
    public Map<String, Object> getQna(@PathVariable int classNumber) {
        Map<String, Object> map = new HashMap<>();

        // 게시판
        List<QNABoardDTO> qnaBoards = qnaBoardService.selectQnaBoards(classNumber);

        // 댓글
        Map<Integer, List<QNACommentDTO>> commentsMap = new HashMap<>();

        for (QNABoardDTO qna : qnaBoards) {
            int askNumber = qna.getAskNumber();
            List<QNACommentDTO> comments = qnaCommentService.selectComments(askNumber);
            commentsMap.put(askNumber, comments);
        }

        map.put("qnaBoard", qnaBoards);
        map.put("comments", commentsMap);
        return map;
    }

    @PostMapping("/class/{classNumber}/qna/write")
    public Map<String, Object> writeQna(@RequestHeader("Authorization") String token,
            @RequestPart("params") String params) {
        Map<String, Object> map = new HashMap<>();

        try {
            token = token != null ? token.replace("Bearer ", "") : null;
            String uno = tokenProvider.getUserNumberFromToken(token);

            System.out.println(params);

            // JSON 데이터를 DTO로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            QNABoardDTO qnaBoardDTO = objectMapper.readValue(params, QNABoardDTO.class);
            qnaBoardDTO.setUno(uno);

            System.out.println(qnaBoardDTO);

            boolean result = qnaBoardService.writeQna(qnaBoardDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "질문이 성공적으로 등록되었습니다.");
            } else {
                map.put("code", 0);
                map.put("msg", "질문 등록에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "질문 등록 중 오류가 발생했습니다.");
            e.printStackTrace();
        }

        return map;
    }

    @PostMapping("/class/{classNumber}/qna/comment")
    public Map<String, Object> addComment(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> params) {
        Map<String, Object> map = new HashMap<>();

        try {

            token = token != null ? token.replace("Bearer ", "") : null;
            String uno = tokenProvider.getUserNumberFromToken(token);

            String commentContent = params.get("commentContent");
            int askNumber = Integer.parseInt(params.get("askNumber"));

            QNACommentDTO commentDTO = new QNACommentDTO();
            commentDTO.setUno(uno);
            commentDTO.setAskNumber(askNumber);
            commentDTO.setCommentContent(commentContent);

            boolean result = qnaCommentService.addComment(commentDTO);

            if (result) {
                map.put("code", 1);
                map.put("msg", "답변이 성공적으로 등록되었습니다.");
                map.put("commentNumber", commentDTO.getCommentNumber());

                String userName = qnaCommentService.getUserNameByUno(uno);
                map.put("name", userName);
            } else {
                map.put("code", 0);
                map.put("msg", "답변 등록에 실패했습니다.");
            }
        } catch (Exception e) {
            map.put("code", 0);
            map.put("msg", "답변 등록 중 오류가 발생했습니다.");
            e.printStackTrace();
        }

        return map;
    }

    // 질문 수정
    @PutMapping("/class/{classNumber}/qna/{askNumber}")
    public Map<String, Object> updateAsk(
            @PathVariable int classNumber,
            @PathVariable int askNumber,
            @RequestBody QNABoardDTO qnaBoardDTO) {

        Map<String, Object> map = new HashMap<>();
        qnaBoardDTO.setAskNumber(askNumber);
        boolean result = qnaBoardService.updateAsk(qnaBoardDTO);

        map.put("code", result ? 1 : 0);
        map.put("msg", result ? "질문이 성공적으로 수정되었습니다." : "질문 수정에 실패했습니다.");
        return map;
    }

    // 질문 삭제
    @DeleteMapping("/class/{classNumber}/qna/{askNumber}")
    public Map<String, Object> deleteAsk(
            @PathVariable int classNumber,
            @PathVariable int askNumber) {

        boolean result = qnaBoardService.deleteAsk(askNumber);

        Map<String, Object> map = new HashMap<>();
        map.put("code", result ? 1 : 0);
        map.put("msg", result ? "질문이 성공적으로 삭제되었습니다." : "질문 삭제에 실패했습니다.");
        return map;
    }

    // 답변 삭제
    @DeleteMapping("/class/{classNumber}/qna/comment/{commentNumber}")
    public Map<String, Object> deleteComment(
            @PathVariable int classNumber,
            @PathVariable int commentNumber) {

        boolean result = qnaCommentService.deleteComment(commentNumber);

        Map<String, Object> map = new HashMap<>();
        map.put("code", result ? 1 : 0);
        map.put("msg", result ? "답변이 성공적으로 삭제되었습니다." : "답변 삭제에 실패했습니다.");

        return map;
    }

}