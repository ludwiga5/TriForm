package controllers;

import java.util.Map;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PutMapping;

import entities.User;
import entities.Workout;
import dto.WorkoutResponse;
import dto.WorkoutRequest;
import exceptions.UserNotFoundException;
import exceptions.WorkoutNotFoundException;
import repositories.UserRepository;
import repositories.WorkoutRepository;
import services.WorkoutService;

@RestController
@RequestMapping("/api")
public class WorkoutController {
    
    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final WorkoutService workoutService;

    // injects
    public WorkoutController(UserRepository userRepository, WorkoutRepository workoutRepository, WorkoutService workoutService){
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.workoutService = workoutService;
    }

    // workout enpoints

    // log a workout
    @PostMapping("/workout")
    public ResponseEntity<?> createWorkout(@AuthenticationPrincipal String username, @RequestBody WorkoutRequest workoutData){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        workoutService.createWorkout(user, workoutData);
        return ResponseEntity.status(201).body(
            Map.of("message", "Workout Created Successfully")
        );

    }

    // update a workout
    @PutMapping("/workout/{id}")
    public ResponseEntity<?> updateWorkout(@AuthenticationPrincipal String username, @PathVariable Long id, @RequestBody WorkoutRequest workoutData){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        Workout workout = workoutRepository.findById(id)
            .orElseThrow(() -> new WorkoutNotFoundException("Workout not found"));
        if (!workout.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(
                Map.of("error", "Forbidden")
            );
        }
        workoutService.updateWorkout(workout, workoutData);
        return ResponseEntity.ok(
            Map.of(
                "message", "Workout Updated Successfully")
        );
    }

    @GetMapping("/workout")
    public ResponseEntity<?> workouts(@AuthenticationPrincipal String username){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        List<Workout> workouts = workoutRepository.findByUserId(user.getId());
        List<WorkoutResponse> response = workouts.stream()
            .map(WorkoutResponse::new)
            .toList();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/workout/{id}")
    public ResponseEntity<?> deleteWorkout(@AuthenticationPrincipal String username, @PathVariable Long id){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        Workout workout = workoutRepository.findById(id)
            .orElseThrow(() -> new WorkoutNotFoundException("Workout not found"));
        if (!workout.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(
                Map.of("error", "Forbidden")
            );
        }
        workoutService.deleteWorkout(workout);
        return ResponseEntity.ok(
            Map.of(
                "message", "Workout Successfully Deleted")
        );

    }

    @ExceptionHandler(WorkoutNotFoundException.class)
    public ResponseEntity<?> handleWorkoutNotFound(WorkoutNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleBadRequest(HttpMessageNotReadableException e) {
        return ResponseEntity.status(400).body(
            Map.of("error", "Invalid date. Expected MM-DD-YYYY")
        );
    }
}
