package repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import entities.PlannedWorkout;

public interface PlannedWorkoutRepository extends JpaRepository <PlannedWorkout, Long> {

    List<PlannedWorkout> findByUserId(Long userId);
    List<PlannedWorkout> findByTrainingPlanId(Long trainingPlanId);
    List<PlannedWorkout> findByUserIdAndScheduledDateOrderByDisciplineAsc(
        Long userId, 
        LocalDate scheduledDate
    );
    List<PlannedWorkout> findByUserIdAndScheduledDateBetweenOrderByScheduledDateAsc(
        Long userId,
        LocalDate startDate,
        LocalDate endDate
    );
    List<PlannedWorkout> findByTrainingPlanIdOrderByScheduledDateAsc(Long trainingPlanId);
    void deleteByTrainingPlanId(Long trainingPlanId);

}