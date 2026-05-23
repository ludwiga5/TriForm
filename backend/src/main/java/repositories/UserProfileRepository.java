package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import entities.UserProfile;

public interface UserProfileRepository extends JpaRepository <UserProfile, Long>{

    Optional<UserProfile> findByUserId(Long userId);
}