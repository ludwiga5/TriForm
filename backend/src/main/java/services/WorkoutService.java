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
        workout.setUser(user);
        workout.setWorkoutDiscipline(data.getDiscipline());
        workout.setWorkoutDate(data.getDate());
        workout.setWorkoutDistance(data.getDistance());
        workout.setWorkoutDurationMinutes(data.getDurationMin());
        workout.setWorkoutNotes(data.getNotes());
        workout.setWorkoutType(data.getType());
        workout.setWorkoutTitle(data.getTitle());
        workoutRepository.save(workout);
    }

    public void updateWorkout(Workout workout, WorkoutRequest data){
        workout.setWorkoutDiscipline(data.getDiscipline());
        workout.setWorkoutDate(data.getDate());
        workout.setWorkoutDistance(data.getDistance());
        workout.setWorkoutDurationMinutes(data.getDurationMin());
        workout.setWorkoutNotes(data.getNotes());
        workout.setWorkoutType(data.getType());
        workout.setWorkoutTitle(data.getTitle());
        workoutRepository.save(workout);
    }

    public void deleteWorkout(Workout workout){
        workoutRepository.delete(workout);
    }
}