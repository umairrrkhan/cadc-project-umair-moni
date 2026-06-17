package com.umni.vision.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;


@Document (collection = "drawing")
public class Vision {
	
	@Id
	private String id;
	
	public Vision(String id, String userId, String title, String originalImageKey, String solvedImageKey,
			Instant createdAt, Instant updatedAt) {
		super();
		this.id = id;
		this.userId = userId;
		this.title = title;
		this.originalImageKey = originalImageKey;
		this.solvedImageKey = solvedImageKey;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	@Indexed
	private String userId;
	
	private String title;
	
	private String originalImageKey;
	private String solvedImageKey;
	
	private Instant createdAt;
    private Instant updatedAt;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getOriginalImageKey() {
		return originalImageKey;
	}
	public void setOriginalImageKey(String originalImageKey) {
		this.originalImageKey = originalImageKey;
	}
	public String getSolvedImageKey() {
		return solvedImageKey;
	}
	public void setSolvedImageKey(String solvedImageKey) {
		this.solvedImageKey = solvedImageKey;
	}
	public Instant getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
	public Instant getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
    
    
}
