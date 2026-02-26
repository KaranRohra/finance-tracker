package com.fintrack.backend.service;

import com.fintrack.backend.model.ChatMessage;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.ChatMessageRepository;
import com.fintrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TransactionRepository transactionRepository;
    private final GeminiService geminiService;

    public List<ChatMessage> getHistory(User user) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(user.getId());
    }

    @Transactional
    public ChatMessage sendMessage(User user, String userMessage) {
        // Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .user(user)
                .role("user")
                .content(userMessage)
                .build();
        chatMessageRepository.save(userMsg);

        // Build transaction context (last 50 transactions)
        String context = buildTransactionContext(user);

        // Get last 10 messages for history
        List<ChatMessage> recentHistory = chatMessageRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 10));
        List<Map<String, String>> historyMaps = recentHistory.stream()
                .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                .collect(Collectors.toList());

        String aiResponse;
        try {
            aiResponse = geminiService.chatWithContext(userMessage, context, historyMaps);
        } catch (Exception e) {
            log.error("Gemini chat error: {}", e.getMessage());
            aiResponse = "I'm sorry, I encountered an error processing your request. Please try again.";
        }

        // Save assistant message
        ChatMessage assistantMsg = ChatMessage.builder()
                .user(user)
                .role("assistant")
                .content(aiResponse)
                .build();
        return chatMessageRepository.save(assistantMsg);
    }

    private String buildTransactionContext(User user) {
        List<Transaction> recent = transactionRepository.findRecentByUserId(
                user.getId(), PageRequest.of(0, 50));

        if (recent.isEmpty())
            return "No transactions found yet.";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        StringBuilder sb = new StringBuilder();
        sb.append("Recent transactions (last 50):\n");

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (Transaction t : recent) {
            sb.append(String.format("- %s | %s %s %.2f | %s | %s\n",
                    t.getTransactionDate().format(fmt),
                    t.getType(),
                    t.getCurrency(),
                    t.getAmount(),
                    t.getMerchant() != null ? t.getMerchant() : "Unknown",
                    t.getCategory() != null ? t.getCategory() : "Uncategorized"));
            if (t.getType() == Transaction.TransactionType.DEBIT) {
                totalDebit = totalDebit.add(t.getAmount());
            } else {
                totalCredit = totalCredit.add(t.getAmount());
            }
        }

        sb.append(String.format("\nSummary: Total Spent: %.2f INR | Total Received: %.2f INR | Net: %.2f INR",
                totalDebit, totalCredit, totalCredit.subtract(totalDebit)));

        return sb.toString();
    }
}
