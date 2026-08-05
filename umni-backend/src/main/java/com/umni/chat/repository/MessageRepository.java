package com.umni.chat.repository;

import com.umni.chat.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends MongoRepository<Message , String> {
	
	interface MessagePreview{
		String getId();
		String getContent();
		Instant getCreatedAt(); 
	}
	
	Page<MessagePreview> findByChatIdAndDeletedFalseOrderByCreatedAtAsc(String chatId , Pageable pageable);
	
	List<Message> findByChatIdAndDeletedFalseOrderByCreatedAtAsc(String chatId);
	
		
	void deleteByChatId(String chatId);

	void deleteByUserId(String userId);
	
	 List<Message> findByChatIdAndCreatedAtBetween(String chatId, Instant start, Instant end);
}
