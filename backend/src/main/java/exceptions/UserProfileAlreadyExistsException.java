package exceptions;

public class UserProfileAlreadyExistsException extends RuntimeException{
    
    public UserProfileAlreadyExistsException(String message){
        super(message);
    }

}
