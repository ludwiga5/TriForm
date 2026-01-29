package entities;

//Imports
import jakarta.persistence.*;

//Handles User Entity
@Entity
@Table(name = "Users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username",nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false, unique = true)
    private String password;

    @Column(name = "email", nullable = false, unique = true)
    private String email;



    //Get Methods
    public Long getId(){    
        return id;

    } public String getUsername(){
        return username;

    } public String getEmail(){
        return email;

    } public String getPassword(){
        return password;

    }

    //Set Methods
    public void setId(Long newId){
        id = newId;

    } public void setUsername(String newUsername){
        username = newUsername;

    } public void setEmail(String newEmail){
        email = newEmail;

    } public void setPassword(String newPassword){
        password = newPassword;
        
    }
}
