package dto;

import java.time.LocalDate;

public class WorkoutRequest {
    
    private String discipline;
    private LocalDate date;
    private int durationMin;
    private int distance;
    private String notes;

        // getters
    public String getWorkoutDiscipline(){
        return discipline;
    }
    public LocalDate getWorkoutDate(){
        return date;
    }
    public int getWorkoutDurationMinutes(){
        return durationMin;
    }
    public int getWorkoutDistance(){
        return distance;
    }
    public String getWorkoutNotes(){
        return notes;
    }

    // setters
    public void setWorkoutDiscipline(String newDiscipline){
        this.discipline = newDiscipline;
    }
    public void setWorkoutDate(LocalDate newDate){
        this.date = newDate;
    }
    public void setWorkoutDurationMinutes(int newDurationMin){
        this.durationMin = newDurationMin;
    }
    public void setWorkoutDistance(int newDistance){
        this.distance = newDistance;
    }
    public void setWorkoutNotes(String newNotes){
        this.notes = newNotes;
    }   
}
