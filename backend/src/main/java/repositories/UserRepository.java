package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import entities.User;

public interface UserRepository extends JpaRepository <User, Long>{
    
    Optional <User> findByUsername(String username);
    Optional <User> findByEmail(String email);
    Optional <User> findByEmailOrUsername(String email, String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    }
