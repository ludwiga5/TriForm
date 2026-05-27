package controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import entities.User;
import entities.TrainingPlan;
import dto.GeneratePlanRequest;
import dto.TrainingPlanDetailResponse;
import exceptions.UserNotFoundException;
import repositories.PlannedWorkoutRepository;
import repositories.TrainingPlanRepository;
import repositories.UserRepository;
import services.TrainingPlanService;
import exceptions.TrainingPlanNotFoundException;


@RestController
@RequestMapping("/api")
public class TrainingPlanController {
    
    public UserRepository userRepository;
    public TrainingPlanService trainingPlanService;
    public TrainingPlanRepository trainingPlanRepository;
    public PlannedWorkoutRepository plannedWorkoutRepository;

    //injects
    public TrainingPlanController(
        UserRepository userRepository, 
        TrainingPlanService trainingPlanService, 
        TrainingPlanRepository trainingPlanRepository,
        PlannedWorkoutRepository plannedWorkoutRepository)
    {
        this.userRepository = userRepository;
        this.trainingPlanService = trainingPlanService;
        this.trainingPlanRepository = trainingPlanRepository;
        this.plannedWorkoutRepository = plannedWorkoutRepository;
    }

    @PostMapping("/plans/generate")
    public ResponseEntity<?> createTrainingPlan(
        @AuthenticationPrincipal String username,
        @RequestBody GeneratePlanRequest planData
    ) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        TrainingPlanDetailResponse response = trainingPlanService.generatePlan(user, planData);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/plans")
    public ResponseEntity<?> trainingPlans(@AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(trainingPlanService.getPlansForUser(user));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<?> trainingPlanDetails(
        @AuthenticationPrincipal String username,
        @PathVariable Long id
    ) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(trainingPlanService.getPlanDetails(user, id));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<?> deleteTrainingPlan(@AuthenticationPrincipal String username, @PathVariable Long id){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        TrainingPlan plan = trainingPlanRepository.findById(id)
            .orElseThrow(() -> new TrainingPlanNotFoundException("Training Plan not found"));
        if (!plan.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(
                Map.of("error", "Forbidden")
            );
        }
        trainingPlanService.deletePlan(plan);
        return ResponseEntity.ok(
            Map.of(
                "message", "Training Plan Successfully Deleted")
        );

    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler(TrainingPlanNotFoundException.class)
    public ResponseEntity<?> handleTrainingPlanNotFound(TrainingPlanNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleSecurityException(SecurityException e) {
        return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
    }

}
