package com.umni.vision.repository;

import com.umni.vision.model.Vision;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface VisionRepository extends MongoRepository<Vision , String> {
	List<Vision > findByUserIdOrderByCreatedAtDesc(String userId);
	void deleteByUserIdAndId(String userId , String id);

}
