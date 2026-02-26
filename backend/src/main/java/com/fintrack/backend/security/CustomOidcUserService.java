package com.fintrack.backend.security;

import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String googleId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String pictureUrl = oidcUser.getPicture();

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
        return oidcUser;
    }
}
