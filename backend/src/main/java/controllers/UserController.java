package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import entities.User;
import entities.UserProfile;
import exceptions.UserNotFoundException;
import repositories.UserRepository;
import repositories.UserProfileRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    //Injects
    public UserController(UserRepository userRepository, UserProfileRepository userProfileRepository){
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    //Profile Endpoint

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
