package com.fintrack.backend.service;

import com.fintrack.backend.model.User;
import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailService {

    @Value("${app.gmail.bank-senders}")
    private List<String> bankSenders;

    public List<Message> fetchBankEmails(User user, String pageToken) throws GeneralSecurityException, IOException {
        Gmail gmail = buildGmailClient(user.getGmailAccessToken());
        String query = buildGmailQuery();

        Gmail.Users.Messages.List listRequest = gmail.users().messages()
                .list("me")
                .setQ(query)
                .setMaxResults(50L);

        if (pageToken != null) {
            listRequest.setPageToken(pageToken);
        }

        ListMessagesResponse response = listRequest.execute();
        List<Message> messages = response.getMessages();
        if (messages == null)
            return new ArrayList<>();

        // Fetch full messages
        List<Message> fullMessages = new ArrayList<>();
        for (Message msg : messages) {
            try {
                Message fullMsg = gmail.users().messages().get("me", msg.getId())
                        .setFormat("full").execute();
                fullMessages.add(fullMsg);
            } catch (Exception e) {
                log.warn("Failed to fetch message {}: {}", msg.getId(), e.getMessage());
            }
        }
        return fullMessages;
    }

    public String extractEmailBody(Message message) {
        if (message.getPayload() == null)
            return "";
        return extractBodyFromPart(message.getPayload());
    }

    private String extractBodyFromPart(MessagePart part) {
        if (part.getBody() != null && part.getBody().getData() != null) {
            byte[] decoded = Base64.getUrlDecoder().decode(part.getBody().getData());
            return new String(decoded, StandardCharsets.UTF_8);
        }
        if (part.getParts() != null) {
            for (MessagePart subPart : part.getParts()) {
                String mimeType = subPart.getMimeType();
                if ("text/plain".equals(mimeType) || "text/html".equals(mimeType)) {
                    String body = extractBodyFromPart(subPart);
                    if (!body.isBlank())
                        return body;
                }
            }
            for (MessagePart subPart : part.getParts()) {
                String body = extractBodyFromPart(subPart);
                if (!body.isBlank())
                    return body;
            }
        }
        return "";
    }

    private Gmail buildGmailClient(String accessToken) throws GeneralSecurityException, IOException {
        Credential credential = new Credential(BearerToken.authorizationHeaderAccessMethod())
                .setAccessToken(accessToken);

        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential).setApplicationName("FinanceTracker").build();
    }

    private String buildGmailQuery() {
        StringBuilder query = new StringBuilder("(");
        for (int i = 0; i < bankSenders.size(); i++) {
            query.append("from:").append(bankSenders.get(i));
            if (i < bankSenders.size() - 1)
                query.append(" OR ");
        }
        query.append(
                ") (subject:transaction OR subject:debited OR subject:credited OR subject:payment OR subject:spent OR subject:alert)");
        return query.toString();
    }
}
