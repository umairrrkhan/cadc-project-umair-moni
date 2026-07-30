package com.umni.auth.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.umni.auth.repository.UserRepository;
import com.umni.chat.repository.ChatSessionRepository;
import com.umni.chat.repository.MessageRepository;
import com.umni.chat.model.ChatSession;
import com.umni.vision.model.Vision;
import com.umni.vision.repository.VisionRepository;
import com.umni.vision.service.S3StorageService;

@Service
public class AccountDeletionService {

    private final NoteAccountClient noteAccountClient;
    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final VisionRepository visionRepository;
    private final S3StorageService s3StorageService;
    private final UserRepository userRepository;

    public AccountDeletionService(NoteAccountClient noteAccountClient,
            ChatSessionRepository chatSessionRepository,
            MessageRepository messageRepository,
            VisionRepository visionRepository,
            S3StorageService s3StorageService,
            UserRepository userRepository) {
        this.noteAccountClient = noteAccountClient;
        this.chatSessionRepository = chatSessionRepository;
        this.messageRepository = messageRepository;
        this.visionRepository = visionRepository;
        this.s3StorageService = s3StorageService;
        this.userRepository = userRepository;
    }

    public void deleteAccount(String userId, String authorizationHeader) {
        noteAccountClient.deleteCurrentUserNotes(authorizationHeader);

        List<Vision> visions = visionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Vision vision : visions) {
            deleteImageBestEffort(vision.getOriginalImageKey());
            deleteImageBestEffort(vision.getSolvedImageKey());
        }

        List<ChatSession> sessions =
                chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        for (ChatSession session : sessions) {
            messageRepository.deleteByChatId(session.getId());
        }
        messageRepository.deleteByUserId(userId);
        chatSessionRepository.deleteByUserId(userId);
        visionRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }

    private void deleteImageBestEffort(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            s3StorageService.deleteImageByUrl(imageUrl);
        } catch (Exception error) {
            System.out.println("Account deletion could not remove S3 image: " + error.getMessage());
        }
    }
}
