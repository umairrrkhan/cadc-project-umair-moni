package com.umni.repository;

import com.umni.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository {
	
	List<Message> findByChatIdOrderByCreatedAsc(String chatId);
	
	void deletedByChatId(String chatId);
}
