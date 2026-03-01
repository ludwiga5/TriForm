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

//Handles User registration & login
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //Injects
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    //Registers a New User
    //Generates username, email, password and checks against the UserRepository
    //Then hashes the users password
    //Saves the new user in UserRepository
    //Then returns the user information
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

        //Once the User is saved, remove the local password value
        user.setPassword(null);
        
        System.out.println("Register Successful");
        return user;
    
    } 
    //Logs in User
    //Checks for user against UserRepository
    //If the user exists and information matches return JWT token
    public User authenticateByIdentifier(String identifier, String rawPassword) throws UserNotFoundException, IncorrectPasswordException{

            //Checks for user existence from Username/email on login
            User user = userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

            if(!passwordEncoder.matches(rawPassword, user.getPassword())){
                throw new IncorrectPasswordException("Incorrect Password");
            }

            return user;

    }


}