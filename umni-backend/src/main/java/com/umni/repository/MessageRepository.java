package com.umni.repository;

import com.umni.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.Instant;

public interface MessageRepository extends MongoRepository {
	
	interface MessagePreview{
		String getId();
		String getContent();
		Instant getCreatedAt(); 
	}
	
	List<Message> findByChatIdOrderByCreatedAsc(String chatId);
	
	void deletedByChatId(String chatId);
	
}
