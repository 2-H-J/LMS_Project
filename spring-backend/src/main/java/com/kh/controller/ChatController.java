package com.kh.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.kh.chat.ChatRoom;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ChatController {
    private static final HashMap<String, ChatRoom> chatRooms = new HashMap<>();

    @GetMapping("/chat/rooms")
    public List<String> getChatRooms() {
        return chatRooms.keySet().stream().collect(Collectors.toList());
    }

    @GetMapping("/chat/room")
    public ChatRoom getChatRoom(@RequestParam String classNumber) {
        return chatRooms.get(classNumber);
    }
}
