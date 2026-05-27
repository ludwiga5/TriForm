package dto;

import java.time.LocalDate;
import java.util.List;

import entities.PlanStatus;
import entities.RaceType;

public class TrainingPlanDetailResponse {
    
    private Long raceGoalId;
    private String raceName;
    private RaceType raceType;
    private LocalDate raceDay;
    private String location;
    private PlanStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate createdDate;
    private int totalWorkouts;
    private List<PlannedWorkoutResponse> workouts;

    // getters
    public Long getRaceGoalId() {
        return raceGoalId;
    }

    public String getRaceName() {
        return raceName;
    }

    public RaceType getRaceType() {
        return raceType;
    }

    public LocalDate getRaceDay() {
        return raceDay;
    }

    public String getLocation() {
        return location;
    }

    public PlanStatus getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public int getTotalWorkouts() {
        return totalWorkouts;
    }

    public List<PlannedWorkoutResponse> getWorkouts() {
        return workouts;
    }

    // setters
    public void setRaceGoalId(Long raceGoalId) {
        this.raceGoalId = raceGoalId;
    }

    public void setRaceName(String raceName) {
        this.raceName = raceName;
    }

    public void setRaceType(RaceType raceType) {
        this.raceType = raceType;
    }

    public void setRaceDay(LocalDate raceDay) {
        this.raceDay = raceDay;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setStatus(PlanStatus status) {
        this.status = status;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public void setTotalWorkouts(int totalWorkouts) {
        this.totalWorkouts = totalWorkouts;
    }

    public void setWorkouts(List<PlannedWorkoutResponse> workouts) {
        this.workouts = workouts;
    }
}
