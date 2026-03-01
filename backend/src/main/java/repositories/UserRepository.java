package repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import entities.User;

public interface UserRepository extends JpaRepository <User, Long>{
    
    User findByUsername(String username);
    User findByEmail(String email);
    Optional<User> findByEmailOrUsername(String email, String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    }
