package com.kh.chat;

import java.util.HashSet;
import java.util.Set;

import org.springframework.web.socket.WebSocketSession;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoom {
    private String lectureId;  // 강의 ID
    private String instructorId; // 강의 작성자 ID
    private Set<WebSocketSession> sessions = new HashSet<>();

    public ChatRoom(String lectureId, String instructorId) {
        this.lectureId = lectureId;
        this.instructorId = instructorId;
    }
    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }

    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }

    public void broadcast(String message) throws Exception {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new org.springframework.web.socket.TextMessage(message));
            }
        }
    }
}

