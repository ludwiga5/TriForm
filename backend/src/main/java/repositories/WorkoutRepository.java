package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import entities.Workout;

public interface WorkoutRepository extends JpaRepository <Workout, Long>{
        List<Workout>findByUserId(Long userId);
}
