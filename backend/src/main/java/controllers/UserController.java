package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.JwtResponse;
import entities.User;
import services.UserService;
import services.JwtService;
import repositories.UserRepository;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api")
public class UserController {

    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, JwtService jwtService, UserRepository userRepository){
        this.userService = userService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    //Registration Endpoint
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        savedUser.setPassword(null);
        return savedUser;
    }

    //Login Endpoint
    @PostMapping("/login")
    public JwtResponse login(@RequestBody User user){
        JwtResponse loginToken = userService.loginUser(user);
        return loginToken;
    }

    //Profile Endpoint
    @GetMapping("/profile")
    public User profile(@RequestHeader("Authorization") String authToken) {
        String token = authToken.replace("Bearer ", "");
        jwtService.validateToken(token);
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username);
        return user;
    }
    
    

}
