package repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import entities.PlannedWorkout;

public interface PlannedWorkoutRepository extends JpaRepository <PlannedWorkout, Long> {

    List<PlannedWorkout> findByUserId(Long userId);
    List<PlannedWorkout> findByTrainingPlanId(Long trainingPlanId);
    List<PlannedWorkout> findByTrainingPlanIdOrderByScheduledDateAsc(Long trainingPlanId);

}