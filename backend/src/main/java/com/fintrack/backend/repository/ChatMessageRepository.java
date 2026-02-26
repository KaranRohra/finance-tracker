package com.fintrack.backend.repository;

import com.fintrack.backend.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(UUID userId);

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
