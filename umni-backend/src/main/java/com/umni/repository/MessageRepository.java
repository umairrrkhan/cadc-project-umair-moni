package com.umni.repository;

import com.umni.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.Instant;

public interface MessageRepository extends MongoRepository<Message , String> {
	
	interface MessagePreview{
		String getId();
		String getContent();
		Instant getCreatedAt(); 
	}
	
	List<MessagePreview> findByChatIdOrderByCreatedAtAsc(String chatId);
	
	void deleteByChatId(String chatId);
	
}
