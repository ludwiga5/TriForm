package dto;

import java.time.LocalDate;

import entities.Workout;
import entities.Workout.WorkoutType;

public class WorkoutResponse {
    private Long id;
    private String discipline;
    private LocalDate date;
    private int durationMin;
    private float distance;
    private String notes;
    private String title;
    private WorkoutType type;

    public WorkoutResponse(Workout workout){
        this.id = workout.getId();
        this.discipline = workout.getWorkoutDiscipline();
        this.date = workout. getWorkoutDate();
        this.durationMin = workout.getWorkoutDurationMinutes();
        this.distance = workout.getWorkoutDistance();
        this.notes = workout.getWorkoutNotes();
        this.type = workout.getWorkoutType();
        this.title = workout.getWorkoutTitle();
    }
    public Long getId(){
        return id;
    }
    public String getWorkoutDiscipline(){
        return discipline;
    }
    public LocalDate getWorkoutDate(){
        return date;
    }
    public int getWorkoutDurationMinutes(){
        return durationMin;
    }
    public float getWorkoutDistance(){
        return distance;
    }
    public String getWorkoutNotes(){
        return notes;
    }
    public WorkoutType getWorkoutType() { 
        return type; 
    }
    public String getWorkoutTitle() { 
        return title; 
    }
}
