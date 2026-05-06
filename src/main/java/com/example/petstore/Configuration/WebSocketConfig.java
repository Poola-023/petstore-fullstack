package com.example.petstore.Configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 1. This is the endpoint React will connect to: ws://localhost:8080/ws-chat
        // setAllowedOriginPatterns("*") fixes CORS issues from React (localhost:3000)
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Fallback for browsers that don't support WebSockets
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 2. Prefix for messages going OUT from Server TO Client
        registry.enableSimpleBroker("/topic");

        // 3. Prefix for messages coming IN from Client TO Server
        registry.setApplicationDestinationPrefixes("/app");
    }
}
