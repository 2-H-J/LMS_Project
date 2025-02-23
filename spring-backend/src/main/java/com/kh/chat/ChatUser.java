package com.kh.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatUser {
    private String userId;
    private String nickname;
    private String lectureId; // 유저가 참여한 강의(채팅방)

    public ChatUser(String userId, String nickname, String lectureId) {
        this.userId = userId;
        this.nickname = nickname;
        this.lectureId = lectureId;
    }
}
