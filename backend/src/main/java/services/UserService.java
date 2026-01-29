package services;

//Imports
import org.springframework.stereotype.Service;

import dto.JwtResponse;
import entities.User;
import repositories.UserRepository;
import exceptions.UsernameAlreadyExistsException;
import exceptions.EmailAlreadyExistsException;
import exceptions.IncorrectPasswordException;
import exceptions.UserNotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;

//Handles User Authentication, Password Hashing
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //Injecting
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    //Registers a New User
    public User registerUser(User user){

        String username = user.getUsername();
        String email = user.getEmail();
        String rawPassword = user.getPassword();

            //Checks for existing user with credentials
            if(userRepository.existsByUsername(username)){
                throw new UsernameAlreadyExistsException("Username already exists");
            }
            if(userRepository.existsByEmail(email)){
                throw new EmailAlreadyExistsException("Email already exists");
            }
    
        //Password Encoding
        user.setPassword(passwordEncoder.encode(rawPassword));

        //Acct Persistence
        userRepository.save(user);
        
        System.out.println("Register Successful");
        return user;
    
    } 
    public JwtResponse loginUser(User user){

        String username = user.getUsername();
        String email = user.getEmail();
        String rawPassword = user.getPassword();

        //Account Existence
        if(userRepository.existsByUsername(username)){
            user = userRepository.findByUsername(username);
        } 
        else if(userRepository.existsByEmail(email)){
            user = userRepository.findByEmail(email);
        } 
        else{
            throw new UserNotFoundException("Account not found");
        }

        String storedHashedPassword = user.getPassword();

        //Password Matching
        if(!passwordEncoder.matches(rawPassword, storedHashedPassword)){
            throw new IncorrectPasswordException("Incorrect Password");
        }

        //Generates JWT
        String token = jwtService.generateToken(username);
        return new JwtResponse(token);

    }


}