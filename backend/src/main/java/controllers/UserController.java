package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

import entities.User;
import entities.UserProfile;
import dto.UserProfileRequest;
import dto.UserProfileResponse;
import exceptions.UserNotFoundException;
import exceptions.UserProfileNotFoundException;
import repositories.UserRepository;
import repositories.UserProfileRepository;
import services.UserProfileService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileService userProfileService;

    //Injects
    public UserController(UserRepository userRepository, UserProfileRepository userProfileRepository, UserProfileService userProfileService){
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userProfileService = userProfileService;
    }

    //Profile Endpoint

    @PostMapping("/profile")
    public ResponseEntity <?> createProfile(@AuthenticationPrincipal String username, @RequestBody UserProfileRequest profileData) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (userProfileRepository.findByUserId(user.getId()).isPresent()) {
            return ResponseEntity.status(409).body(
                Map.of("error", "Profile already exists")
            );
        }
        userProfileService.createUserProfile(user, profileData);
        return ResponseEntity.status(201).body(
            Map.of(
                "message", "User Profile created successfully")
        );
    }

    //Requires authentication for endpoint access
    //After authentication Spring Security stores username on Request Thread
    //So username can be grabbed from Spring and used here for Profile GETing.
    @GetMapping("/profile")
    public ResponseEntity<?> profile(@AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
            .orElse(null);
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "Profile not found"));
        }

        return ResponseEntity.ok(new UserProfileResponse(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity <?> updateProfile(@AuthenticationPrincipal String username, @RequestBody UserProfileRequest profileData) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new UserNotFoundException("Profile not found"));
        // Make sure the workout belongs to the requesting user
        if (!profile.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(
                Map.of("error", "Forbidden")
            );
        }
        userProfileService.updateUserProfile(profile, profileData);
        return ResponseEntity.ok(
            Map.of(
                "message", "User Profile created successfully")
        );

    }


    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(UserProfileNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserProfileNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleBadRequest(HttpMessageNotReadableException e) {
        return ResponseEntity.status(400).body(
            Map.of("error", "Invalid date. Expected MM-DD-YYYY")
        );
    }


    
    

}
