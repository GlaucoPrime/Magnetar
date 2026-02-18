package com.mmo.gerenciador.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LiveController {

    // Recebe o sinal da gameplay e envia para todos os seguidores
    @MessageMapping("/stream")
    @SendTo("/topic/gameplay")
    public String handleStream(String streamData) {
        return streamData;
    }
}