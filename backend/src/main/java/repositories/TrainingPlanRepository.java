package repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import entities.PlanStatus;
import entities.TrainingPlan;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Long>{
    List<TrainingPlan> findByUserId(Long userId);
    Optional<TrainingPlan> findByUserIdAndStatus(Long userId, PlanStatus status);
}
