package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

import entities.User;
import entities.UserProfile;
import exceptions.UserNotFoundException;
import exceptions.UserProfileAlreadyExistsException;
import repositories.UserRepository;
import repositories.UserProfileRepository;
import services.UserProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;



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
    public ResponseEntity <?> createProfile(@AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new UserProfileAlreadyExistsException("Profile not found"));
        try{
            userProfileService.createUserProfile(user, profile);
            return ResponseEntity.status(201).body(
                Map.of(
                    "message", "User Profile created successfully")
            );
        }
        catch(UserNotFoundException | UserProfileAlreadyExistsException e){
            return ResponseEntity.status(409).body(
                Map.of(                
                    "error", e.getMessage()
                )
            );
        }
    }

    //Requires authentication for endpoint access
    //After authentication Spring Security stores username on Request Thread
    //So username can be grabbed from Spring and used here for Profile GETing.
    @GetMapping("/profile")
    public ResponseEntity<?> profile(@AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new UserNotFoundException("Profile not found"));
        return ResponseEntity.ok(profile);
    }


    
    

}
