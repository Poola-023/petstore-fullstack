package com.example.petstore.controller;

import com.example.petstore.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    // Listens for messages sent to "/app/chat"
    @MessageMapping("/chat")
    // Broadcasts the return value to anyone subscribed to "/topic/messages"
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message) {

        // We can ensure the timestamp is perfectly accurate by setting it on the server
        message.setTimestamp(LocalDateTime.now().toString());

        System.out.println("Received message from: " + message.getSenderType() + " -> " + message.getText());

        // Return the message. Spring automatically converts it to JSON and broadcasts it!
        return message;
    }
}
