package com.umni.note_service.repository;

import com.umni.note_service.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository <Note , String> {

	List<Note> findByUserIdOrderByUploadedAtDesc(String userId);
}
