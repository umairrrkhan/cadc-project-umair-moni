package com.umni.chat.repository;

import com.umni.chat.model.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.*;
import java.util.List;

public interface ChatSessionRepository extends MongoRepository<ChatSession, String >  {
	 List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
	 void deleteByUserId(String userId);

}
