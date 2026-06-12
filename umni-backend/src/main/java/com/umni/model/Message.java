package com.umni.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "messages")
@CompoundIndex(name = "chat_created_idx", def = "{'chatId': 1, 'createdAt': 1}")

public class Message {

	@Id
	private String id ;
	
	@Indexed
	private String chatId;
	
	private String role;
	private String content;
	private Instant createdAt;
	private boolean deleted;
	
	public Message() {}
	public Message (String chatId , String role , String content) {
		this.chatId = chatId;
		this.role = role;
		this.content = content;
		this.createdAt = Instant.now();
		this.deleted = false;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getChatId() {
		return chatId;
	}
	public void setChatId(String chatId) {
		this.chatId = chatId;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public Instant getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
	public boolean isDeleted() {
		return deleted;
	}
	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}
	
	
}
