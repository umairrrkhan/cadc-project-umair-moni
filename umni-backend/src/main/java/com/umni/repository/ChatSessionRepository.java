package com.umni.repository;

import com.umni.model.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.*;
import java.util.List;

public interface ChatSessionRepository extends MongoRepository<ChatSession, String >  {
	 List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);

}
