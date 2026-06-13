package com.umni.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;


import java.time.Instant;

import java.util.List;
import java.util.Map;

import com.umni.service.DeepSeekService;
import com.umni.model.ChatSession;
import com.umni.model.Message;
import com.umni.repository.ChatSessionRepository;
import com.umni.repository.MessageRepository;


@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
	
	private final DeepSeekService deepSeekService;
	private final ChatSessionRepository chatSessionRepository;
	 private final MessageRepository messageRepository;
	public ChatController(DeepSeekService deepSeekService, ChatSessionRepository chatSessionRepository,
			MessageRepository messageRepository) {
		this.deepSeekService = deepSeekService;
		this.chatSessionRepository = chatSessionRepository;
		this.messageRepository = messageRepository;
	}
	
	private String getCurrentUserId() {
		return "test-user-id";
	}
	
	@PostMapping("/session/new")
	public Mono<ChatSession> newSession(@RequestBody Map<String , String > payload){
		ChatSession session = new ChatSession();
		session.setUserId(getCurrentUserId());
		session.setTitle(payload.getOrDefault("title", "New chat"));
		session.setCreatedAt(Instant.now());
		session.setUpdatedAt(Instant.now());
		return Mono.just(chatSessionRepository.save(session));
	}
	
	@GetMapping("/session")
	public List<ChatSession> getUserSession(){
		return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(getCurrentUserId());
	}
	
	@GetMapping("/session/{chatId}/messages")
	public List<Message> getSessionMessages(@PathVariable String chatId){
		return messageRepository.findByChatIdAndDeletedFalseOrderByCreatedAtAsc(chatId);
	}
	
	@PostMapping("/session/{chatId}/message")
	public Mono<Map<String , String >> sendMessage(@PathVariable String chatId ,
			@RequestBody Map<String , String > payload){
		String userMessage = payload.get("message");
		Instant now =  Instant.now();
		
		Message userMsg = new Message();
		userMsg.setChatId(chatId);
		userMsg.setRole("user");
		userMsg.setContent(userMessage);
		userMsg.setCreatedAt(now);
		messageRepository.save(userMsg);
		
		
		 ChatSession session = chatSessionRepository.findById(chatId).orElseThrow();
		 session.setUpdatedAt(now);
		 
		 chatSessionRepository.save(session);
		 
		 List<Message> previousMessages = messageRepository.findByChatIdAndDeletedFalseOrderByCreatedAtAsc(chatId);
		 List<Map<String, String>> conversationHistory = previousMessages.stream()
	                .map(msg -> Map.of("role", msg.getRole(), "content", msg.getContent()))
	                .toList();
		 
		 return deepSeekService.getChatCompletionWithHistory(conversationHistory)
	                .map(aiReply -> {
	                	
	                    Message aiMsg = new Message();
	                    aiMsg.setChatId(chatId);
	                    aiMsg.setRole("assistant");
	                    aiMsg.setContent(aiReply);
	                    aiMsg.setCreatedAt(Instant.now());
	                    messageRepository.save(aiMsg);
	                    return Map.of("reply", aiReply);
	                });
	}
	
	
	
	 
	 
	

}
