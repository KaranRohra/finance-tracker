package com.fintrack.backend.config;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String GOOGLE_CLIENT_ID;

    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            HttpRequest googleRequest = HttpRequest.newBuilder()
                    .uri(URI.create(USERINFO_URL))
                    .header("Authorization", "Bearer " + token)
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> googleResponse = client.send(googleRequest, HttpResponse.BodyHandlers.ofString());

            if (googleResponse.statusCode() != 200) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("Invalid access token");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> userInfo = mapper.readValue(googleResponse.body(),
                    new TypeReference<Map<String, Object>>() {
                    });
            String email = (String) userInfo.get("email");

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,
                    token,
                    List.of(new SimpleGrantedAuthority("USER")));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Error validating token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
