package entities;

//Imports
import jakarta.persistence.*;
import java.time.LocalDate;

//Handles User Entity
@Entity
@Table(name = "Users")
public class User extends BaseEntity{

    @Column(name = "username",nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false, unique = false)
    private String password;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "created_at", nullable = false, unique = false)
    private LocalDate createdDate = LocalDate.now();


    //Get Methods
    public String getUsername(){
        return username;

    } public String getEmail(){
        return email;

    } public String getPassword(){
        return password;

    }

    public void setUsername(String newUsername){
        username = newUsername;

    } public void setEmail(String newEmail){
        email = newEmail;

    } public void setPassword(String newPassword){
        password = newPassword;
        
    }
}
