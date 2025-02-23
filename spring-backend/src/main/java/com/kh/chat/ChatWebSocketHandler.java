package com.kh.chat;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.dto.UsersDTO;
import com.kh.service.UsersProgressService;
import com.kh.service.UsersService;
import com.kh.service.ClassService;
import com.kh.dto.ClassDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private static final HashMap<String, ChatRoom> chatRooms = new HashMap<>();
    private static final HashMap<WebSocketSession, ChatUser> sessionUserMap = new HashMap<>();
    private final UsersService usersService;
    private final UsersProgressService usersProgressService;
    private final ClassService classService;

    public ChatWebSocketHandler(UsersService usersService, UsersProgressService usersProgressService, ClassService classService) {
        this.usersService = usersService;
        this.usersProgressService = usersProgressService;
        this.classService = classService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String uno = getUnoFromSession(session);
        String classNumber = getClassNumberFromSession(session);

        if (uno == null || classNumber == null) {
            System.out.println("WebSocket 연결 실패: 사용자 번호 또는 강의 ID 없음.");
            session.close();
            return;
        }

        ClassDTO classDto = classService.selectClass(Integer.parseInt(classNumber));
        boolean isInstructor = String.valueOf(classDto.getUno()).equals(uno);

        boolean isStudent = usersProgressService.checkProgress(uno, Integer.parseInt(classNumber));

        if (!isInstructor && !isStudent) {
            System.out.println("WebSocket 연결 실패: 수강생도 강사도 아님.");
            session.close();
            return;
        }

        UsersDTO userDto = usersService.findUserByUno(uno);
        ChatUser user = new ChatUser(uno, userDto.getNickname(), classNumber);
        sessionUserMap.put(session, user);

        chatRooms.computeIfAbsent(classNumber, id -> new ChatRoom(id, classDto.getUno()))
                 .addSession(session);

        System.out.println("WebSocket 연결됨: " + uno + " 강의: " + classNumber);
    }

    // @Override
    // protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
    //     ChatUser user = sessionUserMap.get(session);
    //     if (user == null) return;
    //     System.out.println("보낸 유저 번호 : " + user.getUserId());
    //     String lectureId = user.getLectureId();
    //     ChatRoom room = chatRooms.get(lectureId);
    //     if (room != null) {
    //         try {
    //             if (room.getInstructorId().equals(user.getUserId())) {
    //                 room.broadcast(user.getNickname() + "(강사) : " + message.getPayload());
    //             } else {
    //                 room.broadcast(user.getNickname() + ": " + message.getPayload());
    //             }
    //         } catch (Exception e) {
    //             e.printStackTrace();
    //         }
    //     }
    // }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
    ChatUser user = sessionUserMap.get(session);
    if (user == null) return;

    System.out.println("보낸 유저 번호 : " + user.getUserId());

    String lectureId = user.getLectureId();
    ChatRoom room = chatRooms.get(lectureId);

    if (room != null) {
        try {
            // 강의 개설자의 ID 가져오기
            String lectureUno = room.getInstructorId(); // 강사 ID (개설자 ID)

            // JSON 데이터 생성
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("uno", user.getUserId());         // 보낸 사람 번호
            messageData.put("nickname", user.getNickname()); // 보낸 사람 닉네임
            messageData.put("lectureUno", lectureUno);       // 강의 개설자 번호
            messageData.put("message", message.getPayload()); // 실제 메시지

            // JSON 문자열로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonMessage = objectMapper.writeValueAsString(messageData);

            // 메시지 전송
            room.broadcast(jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
    

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        ChatUser user = sessionUserMap.remove(session);
        if (user != null) {
            ChatRoom room = chatRooms.get(user.getLectureId());
            if (room != null) {
                room.removeSession(session);
            }
        }
        System.out.println("WebSocket 연결 종료: " + (user != null ? user.getUserId() : "알 수 없음"));
    }

    private String getUnoFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("uno=")) {
                    return param.substring(4);
                }
            }
        }
        return null;
    }

    private String getClassNumberFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("classNumber=")) {
                    return param.substring(12);
                }
            }
        }
        return null;
    }
}
