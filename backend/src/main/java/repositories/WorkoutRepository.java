package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import entities.Workout;

public interface WorkoutRepository extends JpaRepository <Workout, Long>{

        Optional<Workout>findByUserId(Long userId);
}
