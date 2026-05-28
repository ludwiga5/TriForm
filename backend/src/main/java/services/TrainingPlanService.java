package services;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dto.GeneratePlanRequest;
import dto.PlannedWorkoutResponse;
import dto.TrainingPlanDetailResponse;
import dto.TrainingPlanResponse;
import entities.PlanStatus;
import entities.PlannedWorkout;
import repositories.PlannedWorkoutRepository;
import entities.RaceGoal;
import entities.TrainingPlan;
import entities.User;
import entities.WorkoutType;
import exceptions.TrainingPlanNotFoundException;
import exceptions.WorkoutNotFoundException;
import repositories.RaceGoalRepository;
import repositories.TrainingPlanRepository;
import entities.RaceType;

@Service
public class TrainingPlanService {
    
    private final RaceGoalRepository raceGoalRepository;
    private final TrainingPlanRepository trainingPlanRepository;
    private final PlannedWorkoutRepository plannedWorkoutRepository;

    public TrainingPlanService(
        RaceGoalRepository raceGoalRepository, 
        TrainingPlanRepository trainingPlanRepository,
        PlannedWorkoutRepository plannedWorkoutRepository)
    {
        this.raceGoalRepository = raceGoalRepository;
        this.trainingPlanRepository = trainingPlanRepository;
        this.plannedWorkoutRepository = plannedWorkoutRepository;
    }

    public TrainingPlanDetailResponse generatePlan(User user, GeneratePlanRequest planRequest) {
        // establish raceGoal
        RaceGoal raceGoal = new RaceGoal();
        raceGoal.setUser(user);
        raceGoal.setRaceName(planRequest.getRaceName());
        raceGoal.setRaceType(planRequest.getRaceType());
        raceGoal.setRaceDay(planRequest.getRaceDay());
        raceGoal.setLocation(planRequest.getLocation());
        raceGoal.setCreatedDate(LocalDate.now());
        RaceGoal savedRaceGoal = raceGoalRepository.save(raceGoal);
        
        //establish trainingPlan
        int planLengthWeeks = getPlanLengthWeeks(planRequest.getRaceType());
        LocalDate startDate = planRequest.getRaceDay().minusWeeks(planLengthWeeks);
        TrainingPlan plan = new TrainingPlan();
        plan.setUser(user);
        // work backwards from raceday by weeks adjust for RaceType
        plan.setStartDate(startDate);
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Race date is too soon for a full training plan");
        }
        plan.setEndDate(planRequest.getRaceDay());
        plan.setGoal(savedRaceGoal);
        plan.setStatus(PlanStatus.ACTIVE);
        TrainingPlan savedPlan = trainingPlanRepository.save(plan);
    
        // generate workouts in PlannedWorkoutRepository
        generatePlannedWorkouts(user, savedPlan, planLengthWeeks);
    
        // fetch all Planned Workouts
        List<PlannedWorkout> workouts = plannedWorkoutRepository.findByTrainingPlanIdOrderByScheduledDateAsc(savedPlan.getId());
    
        return buildTrainingPlanDetailResponse(savedPlan, workouts);
    }

/*    public TrainingPlanDetailResponse updatePlan(TrainingPlan plan, GeneratePlanRequest planData) {
        
    }
*/
    @Transactional
    public void deletePlan(TrainingPlan plan) {
        plannedWorkoutRepository.deleteByTrainingPlanId(plan.getId());
        trainingPlanRepository.delete(plan);
    }

    // basic plan generator - increases distance + time weekly
    private void generatePlannedWorkouts(User user, TrainingPlan plan, int planLengthWeeks) {
        LocalDate currentWeekStart = plan.getStartDate();

        for (int week = 1; week <= planLengthWeeks; week++) {
            int weeklyProgression = week - 1;

            createPlannedWorkout(
                user,
                plan,
                "Run",
                WorkoutType.EASY,
                "Easy Run",
                currentWeekStart.plusDays(0),
                30 + weeklyProgression * 2,
                3.0f + weeklyProgression * 0.2f,
                "Keep the effort controlled and conversational.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Swim",
                WorkoutType.INTERVALS,
                "Swim Intervals",
                currentWeekStart.plusDays(1),
                35 + weeklyProgression * 2,
                600.0f + weeklyProgression * 50.0f,
                "Focus on form, breathing, and steady intervals.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Bike",
                WorkoutType.TEMPO,
                "Bike Tempo",
                currentWeekStart.plusDays(2),
                45 + weeklyProgression * 3,
                10.0f + weeklyProgression * 0.8f,
                "Ride at a steady tempo effort.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Run",
                WorkoutType.RECOVERY,
                "Recovery Run",
                currentWeekStart.plusDays(3),
                25 + weeklyProgression,
                2.5f + weeklyProgression * 0.1f,
                "Keep this very easy. The goal is recovery.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Swim",
                WorkoutType.EASY,
                "Easy Swim",
                currentWeekStart.plusDays(4),
                30 + weeklyProgression,
                500.0f + weeklyProgression * 40.0f,
                "Relaxed aerobic swim.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Bike",
                WorkoutType.LONG,
                "Long Bike",
                currentWeekStart.plusDays(5),
                60 + weeklyProgression * 5,
                15.0f + weeklyProgression * 1.2f,
                "Long aerobic ride. Do not race this effort.",
                week
            );

            createPlannedWorkout(
                user,
                plan,
                "Run",
                WorkoutType.LONG,
                "Long Run",
                currentWeekStart.plusDays(6),
                40 + weeklyProgression * 3,
                4.0f + weeklyProgression * 0.3f,
                "Build endurance with a controlled long run.",
                week
            );

            currentWeekStart = currentWeekStart.plusWeeks(1);
        }
    }

    private void createPlannedWorkout(
        User user,
        TrainingPlan plan,
        String discipline,
        WorkoutType type,
        String title,
        LocalDate scheduledDate,
        int targetDurationMin,
        float targetDistance,
        String notes,
        int weekNumber) 
    {
        PlannedWorkout workout = new PlannedWorkout();

        workout.setUser(user);
        workout.setTrainingPlan(plan);
        workout.setDiscipline(discipline);
        workout.setType(type);
        workout.setTitle(title);
        workout.setScheduledDate(scheduledDate);
        workout.setTargetDurationMin(targetDurationMin);
        workout.setTargetDistance(targetDistance);
        workout.setNotes(notes);
        workout.setWeekNumber(weekNumber);
        workout.setCompleted(false);

        plannedWorkoutRepository.save(workout);
    }

    private int getPlanLengthWeeks(RaceType raceType) {
        switch (raceType) {
            case SPRINT:
                return 10;
            case OLYMPIC:
                return 14;
            case HALF_IRONMAN:
                return 20;
            case FULL_IRONMAN:
                return 32;
            default:
                throw new IllegalArgumentException("Unsupported race type");
        }
    }


    private TrainingPlanDetailResponse buildTrainingPlanDetailResponse(
        TrainingPlan plan,
        List<PlannedWorkout> workouts
    ) {
        TrainingPlanDetailResponse response = new TrainingPlanDetailResponse();

        RaceGoal goal = plan.getGoal();

        response.setId(plan.getId());
        response.setRaceGoalId(goal.getId());
        response.setRaceName(goal.getRaceName());
        response.setRaceType(goal.getRaceType());
        response.setRaceDay(goal.getRaceDay());
        response.setLocation(goal.getLocation());
        response.setStatus(plan.getStatus());
        response.setStartDate(plan.getStartDate());
        response.setEndDate(plan.getEndDate());
        response.setCreatedDate(plan.getCreatedDate());
        response.setTotalWorkouts(workouts.size());

        List<PlannedWorkoutResponse> workoutResponses = workouts
            .stream()
            .map(PlannedWorkoutResponse::new)
            .collect(Collectors.toList());

        response.setWorkouts(workoutResponses);

        return response;
    }

    public List<TrainingPlanResponse> getPlansForUser(User user){
        List<TrainingPlan> plans = trainingPlanRepository.findByUserId(user.getId());
        List<TrainingPlanResponse> response = plans.stream()
        .map(plan -> {
            TrainingPlanResponse dto = new TrainingPlanResponse();

            dto.setId(plan.getId());
            dto.setRaceGoalId(plan.getGoal().getId());
            dto.setRaceName(plan.getGoal().getRaceName());
            dto.setRaceType(plan.getGoal().getRaceType());
            dto.setRaceDay(plan.getGoal().getRaceDay());
            dto.setLocation(plan.getGoal().getLocation());
            dto.setStatus(plan.getStatus());
            dto.setStartDate(plan.getStartDate());
            dto.setEndDate(plan.getEndDate());
            dto.setCreatedDate(plan.getCreatedDate());

            int totalWorkouts = plannedWorkoutRepository
                .findByTrainingPlanId(plan.getId())
                .size();

            dto.setTotalWorkouts(totalWorkouts);

            return dto;
        })
        .toList();

        return response;
    }

    public TrainingPlanDetailResponse getPlanDetails(User user, Long id) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
            .orElseThrow(() -> new TrainingPlanNotFoundException("Training Plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Forbidden");
        }

        List<PlannedWorkout> workouts = plannedWorkoutRepository
            .findByTrainingPlanIdOrderByScheduledDateAsc(plan.getId());

        return buildTrainingPlanDetailResponse(plan, workouts);
    }

    public PlannedWorkoutResponse markPlannedWorkoutComplete(User user, Long plannedWorkoutId) {
        PlannedWorkout plannedWorkout = plannedWorkoutRepository.findById(plannedWorkoutId)
            .orElseThrow(() -> new WorkoutNotFoundException("Planned workout not found"));

        if (!plannedWorkout.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Forbidden");
        }

        plannedWorkout.setCompleted(true);
        PlannedWorkout savedWorkout = plannedWorkoutRepository.save(plannedWorkout);
        
        return new PlannedWorkoutResponse(savedWorkout);
    }
}


