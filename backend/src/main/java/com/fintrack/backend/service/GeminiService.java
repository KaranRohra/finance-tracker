package com.fintrack.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.api-url}")
    private String apiUrl;

    public String chat(String prompt) throws IOException {
        return callGemini(prompt);
    }

    public String extractTransactionJson(String emailBody) throws IOException {
        String prompt = """
                You are a financial data extractor. Extract transaction details from the following bank/credit card email.
                Return ONLY a valid JSON object with these exact fields:
                {
                  "amount": <number>,
                  "currency": "<3-letter code, default INR>",
                  "merchant": "<merchant name or null>",
                  "type": "<DEBIT or CREDIT>",
                  "transactionDate": "<YYYY-MM-DD>",
                  "bankName": "<bank name>",
                  "accountType": "<BANK or CREDIT_CARD>",
                  "category": "<one of: Food, Travel, Shopping, Entertainment, Healthcare, Utilities, Education, Investment, Salary, Other>",
                  "description": "<brief description>"
                }
                If you cannot extract the information or it's not a transaction email, return: {"error": "not_a_transaction"}

                Email content:
                """
                + emailBody;

        return callGemini(prompt);
    }

    public String chatWithContext(String userMessage, String transactionContext, List<Map<String, String>> history)
            throws IOException {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are a helpful personal finance assistant. ");
        promptBuilder.append("Please respond in plain text, do NOT use markdown, bold text (asterisks), or lists.\n");
        promptBuilder.append("The user's recent financial data:\n");
        promptBuilder.append(transactionContext);
        promptBuilder.append("\n\nConversation history:\n");

        for (Map<String, String> msg : history) {
            String role = "user".equals(msg.get("role")) ? "User" : "Assistant";
            promptBuilder.append(role).append(": ").append(msg.get("content")).append("\n");
        }

        promptBuilder.append("User: ").append(userMessage);
        promptBuilder.append("\n\nAssistant: ");

        return callGemini(promptBuilder.toString());
    }

    private String callGemini(String prompt) throws IOException {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))));

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(apiUrl + "?key=" + apiKey)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Gemini API error: " + response.code() + " " + response.message());
            }
            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        }
    }
}
