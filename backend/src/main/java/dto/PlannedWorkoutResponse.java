package dto;

import java.time.LocalDate;

import entities.PlannedWorkout;
import entities.WorkoutType;

public class PlannedWorkoutResponse {

    private Long id;
    private Long trainingPlanId;
    private String discipline;
    private LocalDate scheduledDate;
    private int targetDurationMin;
    private float targetDistance;
    private String notes;
    private String title;
    private WorkoutType type;
    private int weekNumber;
    private boolean completed;

    public PlannedWorkoutResponse(PlannedWorkout workout){
        this.id = workout.getId();
        this.trainingPlanId = workout.getTrainingPlan().getId();
        this.discipline = workout.getDiscipline();
        this.scheduledDate = workout. getScheduledDate();
        this.targetDurationMin = workout.getTargetDurationMin();
        this.targetDistance = workout.getTargetDistance();
        this.notes = workout.getNotes();
        this.type = workout.getType();
        this.title = workout.getTitle();
        this.weekNumber = workout.getWeekNumber();
        this.completed = workout.getCompleted();
    }
    public Long getId() {
        return id;
    }
    public Long getTrainingPlanId(){
        return trainingPlanId;
    }
    public String getDiscipline(){
        return discipline;
    }
    public LocalDate getScheduledDate(){
        return scheduledDate;
    }
    public int getTargetDurationMin(){
        return targetDurationMin;
    }
    public float getTargetDistance(){
        return targetDistance;
    }
    public String getNotes(){
        return notes;
    }
    public WorkoutType getType() { 
        return type; 
    }
    public String getTitle() { 
        return title; 
    }
    public int getWeekNumber() {
        return weekNumber;
    }
    public Boolean getCompleted() {
        return completed;
    }
}
