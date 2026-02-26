package com.fintrack.backend.security;

import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");

        // Extract tokens from request
        String accessToken = userRequest.getAccessToken().getTokenValue();

        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setName(name);
            user.setPictureUrl(pictureUrl);
            user.setGmailAccessToken(accessToken);
            user.setTokenExpiry(LocalDateTime.now().plusHours(1));
            log.info("Updated existing user: {}", email);
        } else {
            user = User.builder()
                    .googleId(googleId)
                    .email(email)
                    .name(name)
                    .pictureUrl(pictureUrl)
                    .gmailAccessToken(accessToken)
                    .tokenExpiry(LocalDateTime.now().plusHours(1))
                    .build();
            log.info("Created new user: {}", email);
        }

        userRepository.save(user);
        return oAuth2User;
    }
}
