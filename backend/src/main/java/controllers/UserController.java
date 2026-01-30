package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import entities.User;
import services.JwtService;
import repositories.UserRepository;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api")
public class UserController {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    //Injects
    public UserController(JwtService jwtService, UserRepository userRepository){
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    //Profile Endpoint

    //Requires authentication for endpoint access
    //auth token is given with the "Bearer " header which must be removed
    //Then extracts the user based off of the token
    @GetMapping("/profile")
    public User profile(@RequestHeader("Authorization") String authToken) {
        String token = authToken.replace("Bearer ", "");
        jwtService.validateToken(token);
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username);
        return user;
    }
    
    

}
