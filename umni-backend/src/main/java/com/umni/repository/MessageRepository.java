package com.umni.repository;

import com.umni.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.umni.model.ChatSession;

@Repository
public interface MessageRepository extends MongoRepository<Message , String> {
	
	interface MessagePreview{
		String getId();
		String getContent();
		Instant getCreatedAt(); 
	}
	
	Page<MessagePreview> findByChatIdAndDeletedFalseOrderByCreatedAtAsc(String chatId , Pageable pageable);
	
	List<Message> findByChatIdAndDeletedFalseOrderByCreatedAtAsc(String chatId);
	
	List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
	
	List<Message> findByChatIdOrderByTimestampAsc(String chatId);
	
	void deleteByChatId(String chatId);
	
	@Query("{'chatId':?0")
	void softDeleteByChatId(String chatId);
	
	 List<Message> findByChatIdAndCreatedAtBetween(String chatId, Instant start, Instant end);
}
