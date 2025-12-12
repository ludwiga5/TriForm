package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import entities.User;

public interface UserRepository extends JpaRepository <User, Long>{
    
//    findByUsername(String username)
//    findByEmail(String email)

}