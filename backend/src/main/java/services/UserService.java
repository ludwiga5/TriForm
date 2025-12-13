package services;

//Imports
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import entities.User;
import repositories.UserRepository;
import exceptions.UsernameAlreadyExistsException;
import exceptions.EmailAlreadyExistsException;


//Handles User Authentication, Password Hashing
@Component
public class UserService {

    private final UserRepository userRepository;

    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    //Registers a New User
    @Autowired
    public void registerUser(User user){

        String username = user.getUsername();
        String email = user.getEmail();

            //Checks for existing user with credentials
            if(userRepository.existsByUsername(username)){
                throw new UsernameAlreadyExistsException("Username already exists");
            }
            if(userRepository.existsByEmail(email)){
                throw new EmailAlreadyExistsException("Email already exists");
            }
    }
}
