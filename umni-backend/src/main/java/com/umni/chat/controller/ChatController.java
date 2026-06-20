package com.umni.chat.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import reactor.core.publisher.Mono;


import java.time.Instant;

import java.util.List;
import java.util.Map;

import com.umni.common.client.DeepSeekService;
import com.umni.chat.model.ChatSession;
import com.umni.chat.model.Message;
import com.umni.chat.repository.ChatSessionRepository;
import com.umni.chat.repository.MessageRepository;


@RestController
@RequestMapping("/api/chat")
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
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if(auth == null) {
			throw new RuntimeException("User not authethicated");
		}
		
		Object details = auth.getDetails();
		if (details instanceof Map) {
	        Map<String, Object> map = (Map<String, Object>) details;
	        String userId = (String) map.get("userId");
	        if (userId != null) {
	            System.out.println(" found userId from map : " + userId);
	            return userId;
	        }
	    }
		
		Object principal = auth.getPrincipal();
	    if (principal instanceof String && ((String) principal).contains("@")) {
	        System.out.println("only email found in principal, but need userId");
	    }

	    throw new RuntimeException("user ID not found in authentication details");
	}
	
	@PostMapping("/session/new")
	public ChatSession newSession(@RequestBody Map<String , String > payload){
		ChatSession session = new ChatSession();
		session.setUserId(getCurrentUserId());
		session.setTitle(payload.getOrDefault("title", "New chat"));
		session.setCreatedAt(Instant.now());
		session.setUpdatedAt(Instant.now());
		return chatSessionRepository.save(session);
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
		
		String userId= getCurrentUserId();
		
		Message userMsg = new Message();
		userMsg.setChatId(chatId);
		userMsg.setRole("user");
		userMsg.setContent(userMessage);
		userMsg.setCreatedAt(now);
		userMsg.setUserId(userId); 
		messageRepository.save(userMsg);
		
		
		 ChatSession session = chatSessionRepository.findById(chatId).orElseThrow();
		 session.setUpdatedAt(now);
		 
		 // Set title from first user message
		 if (session.getTitle() == null || session.getTitle().equals("New chat") || session.getTitle().equals("New Chat")) {
		     String title = userMessage.length() > 50 ? userMessage.substring(0, 50) + "..." : userMessage;
		     session.setTitle(title);
		 }
		 
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
	                    aiMsg.setUserId(userId); 
	                    messageRepository.save(aiMsg);
	                    return Map.of("reply", aiReply);
	                });
	}
	
	@DeleteMapping("/session/{chatId}")
	public ResponseEntity<Void> deleteSession(@PathVariable String chatId){
		String userId = getCurrentUserId();
		ChatSession session = chatSessionRepository.findById(chatId)
				.orElseThrow(() -> new RuntimeException ("session not found"));
		
		if(!session.getUserId().equals(userId)) {
			throw new RuntimeException("unauthorized");
		}
		
		messageRepository.deleteByChatId(chatId);
		
		chatSessionRepository.deleteById(chatId);
		
		return ResponseEntity.noContent().build();
	}
	
	
	 
	 
	

}
