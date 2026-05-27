package repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import entities.RaceGoal;

public interface RaceGoalRepository extends JpaRepository<RaceGoal, Long> {
    List<RaceGoal> findByUserId(Long userId);
}