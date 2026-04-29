package controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;

import dto.JwtResponse;
import entities.User;
import exceptions.EmailAlreadyExistsException;
import exceptions.IncorrectPasswordException;
import exceptions.UserNotFoundException;
import exceptions.UsernameAlreadyExistsException;
import services.JwtService;
import services.UserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/account")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    //Injects
    public AuthController(UserService userService, JwtService jwtService){
        this.userService = userService;
        this.jwtService = jwtService;
    }

    //Registration Endpoint

    //Registers user in UserService. Then sets password to 
    //null since its hash is saved during registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try{
            userService.registerUser(user);
            return ResponseEntity.status(201).body(
                Map.of(
                    "message", "User created successfully")
            );
        }
        catch(UsernameAlreadyExistsException | EmailAlreadyExistsException e){
            return ResponseEntity.status(409).body(
                Map.of(                
                    "error", e.getMessage()
                )
            );
        }
    }
    //Login Endpoint

    //Checks for registered user value. If the user exists it assigns a JWT token.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String password = request.get("password");
        
        try {
            User user = userService.authenticateByIdentifier(identifier, password);
            String token = jwtService.generateToken(user.getUsername());
            JwtResponse response = new JwtResponse(token);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException | IncorrectPasswordException e) {
            return ResponseEntity.status(401).body(
                Map.of(                  
                    "error", e.getMessage()
                )
            );
        }
    }
}