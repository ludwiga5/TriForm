package services;

import org.springframework.stereotype.Service;

import entities.Workout;
import entities.User;
import dto.WorkoutRequest;
import repositories.WorkoutRepository;

@Service
public class WorkoutService {
    
    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository){
        this.workoutRepository = workoutRepository;
    }

    public void createWorkout(User user, WorkoutRequest data){
        Workout workout = new Workout();
        workout.setWorkoutDiscipline(data.getWorkoutDiscipline());
        workout.setWorkoutDate(data.getWorkoutDate());
        workout.setWorkoutDistance(data.getWorkoutDistance());
        workout.setWorkoutDurationMinutes(data.getWorkoutDurationMinutes());
        workout.setWorkoutNotes(data.getWorkoutNotes());

        workoutRepository.save(workout);
    }

    public void updateWorkout(Workout workout, WorkoutRequest data){
        workout.setWorkoutDiscipline(data.getWorkoutDiscipline());
        workout.setWorkoutDate(data.getWorkoutDate());
        workout.setWorkoutDistance(data.getWorkoutDistance());
        workout.setWorkoutDurationMinutes(data.getWorkoutDurationMinutes());
        workout.setWorkoutNotes(data.getWorkoutNotes());

        workoutRepository.save(workout);
    }
}
