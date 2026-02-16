package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import dto.JwtResponse;
import entities.User;
import services.UserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    //Injects
    public AuthController(UserService userService){
        this.userService = userService;
    }

    //Registration Endpoint

    //Registers user in UserService. Then sets password to 
    //null since its hash is saved during registration
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return savedUser;
    }

    //Login Endpoint

    //Checks for registered user value. If the user exists it assigns a JWT token.
    @PostMapping("/login")
    public JwtResponse login(@RequestBody User user){
        JwtResponse loginToken = userService.loginUser(user);
        return loginToken;
    }
}