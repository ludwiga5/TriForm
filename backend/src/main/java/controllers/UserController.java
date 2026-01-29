package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.JwtResponse;
import entities.User;
import services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
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
    

}
