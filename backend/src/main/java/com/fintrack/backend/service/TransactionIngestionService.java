package com.fintrack.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.UserRepository;
import com.google.api.services.gmail.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionIngestionService {

    private final GmailService gmailService;
    private final GeminiService geminiService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public int syncGmailTransactions(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getGmailAccessToken() == null) {
            throw new RuntimeException("No Gmail access token found. Please login again.");
        }

        int count = 0;
        int processedThisRun = 0;
        try {
            List<Message> emails = gmailService.fetchBankEmails(user, null);
            log.info("Fetched {} emails for user {}", emails.size(), user.getEmail());

            for (Message email : emails) {
                if (processedThisRun >= 5) {
                    log.info("Reached processing limit of 5 emails for this sync to avoid rate limits");
                    break;
                }

                String messageId = email.getId();

                // Skip already processed emails
                if (transactionRepository.existsByUserIdAndRawEmailId(userId, messageId)) {
                    log.debug("Skipping already processed email: {}", messageId);
                    continue;
                }

                String emailBody = gmailService.extractEmailBody(email);
                if (emailBody.isBlank())
                    continue;

                try {
                    processedThisRun++;
                    Thread.sleep(4000); // 4-second delay to respect 15 RPM free tier limit

                    String jsonResponse = geminiService.extractTransactionJson(emailBody);
                    // Strip markdown code blocks if present
                    jsonResponse = jsonResponse.replaceAll("```json[\\r\\n]*", "").replaceAll("[\\r\\n]*```", "")
                            .trim();

                    JsonNode data = objectMapper.readTree(jsonResponse);

                    if (data.has("error")) {
                        log.debug("Email {} is not a transaction email", messageId);
                        continue;
                    }

                    Transaction transaction = buildTransaction(user, data, messageId);
                    transactionRepository.save(transaction);
                    count++;
                    log.info("Saved transaction from email {}: {} {} {}", messageId,
                            transaction.getType(), transaction.getAmount(), transaction.getMerchant());

                } catch (Exception e) {
                    log.warn("Failed to process email {}: {}", messageId, e.getMessage());
                    if (e.getMessage() != null && e.getMessage().contains("429")) {
                        log.warn("Rate limit hit. Stopping sync for now.");
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gmail sync failed for user {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Gmail sync failed: " + e.getMessage(), e);
        }

        return count;
    }

    private Transaction buildTransaction(User user, JsonNode data, String emailId) {
        String amountStr = data.path("amount").asText("0");
        BigDecimal amount = new BigDecimal(amountStr.replaceAll("[^0-9.]", ""));

        String dateStr = data.path("transactionDate").asText(LocalDate.now().toString());
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (Exception e) {
            date = LocalDate.now();
        }

        String typeStr = data.path("type").asText("DEBIT").toUpperCase();
        Transaction.TransactionType type;
        try {
            type = Transaction.TransactionType.valueOf(typeStr);
        } catch (Exception e) {
            type = Transaction.TransactionType.DEBIT;
        }

        String accountTypeStr = data.path("accountType").asText("BANK").toUpperCase();
        Transaction.AccountType accountType;
        try {
            accountType = Transaction.AccountType.valueOf(accountTypeStr);
        } catch (Exception e) {
            accountType = Transaction.AccountType.BANK;
        }

        return Transaction.builder()
                .user(user)
                .amount(amount)
                .currency(data.path("currency").asText("INR"))
                .merchant(data.path("merchant").asText(null))
                .category(data.path("category").asText("Other"))
                .description(data.path("description").asText(null))
                .transactionDate(date)
                .source(Transaction.TransactionSource.GMAIL)
                .rawEmailId(emailId)
                .type(type)
                .accountType(accountType)
                .bankName(data.path("bankName").asText(null))
                .build();
    }
}
