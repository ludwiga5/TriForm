package dto;

import java.time.LocalDate;

import entities.Workout;

public class WorkoutResponse {
    private Long id;
    private String discipline;
    private LocalDate date;
    private int durationMin;
    private float distance;
    private String notes;

    public WorkoutResponse(Workout workout){
        this.id = workout.getId();
        this.discipline = workout.getWorkoutDiscipline();
        this.date = workout. getWorkoutDate();
        this.durationMin = workout.getWorkoutDurationMinutes();
        this.distance = workout.getWorkoutDistance();
        this.notes = workout.getWorkoutNotes();
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
}
