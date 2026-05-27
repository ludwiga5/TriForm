package entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Workouts")
public class Workout extends BaseEntity{
    
    public enum WorkoutType {
        EASY,
        RECOVERY,
        TEMPO,
        INTERVALS,
        LONG,
        RACE,
    };

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Swim, Bike, Run
    @Column(name = "discipline", nullable = false, unique = false)
    private String discipline;

    // user-defined Date of workout
    @Column(name = "date", nullable = false, unique = false)
    private LocalDate date;

    @Column(name = "duration", nullable = false, unique = false)
    private int durationMin;
    
    // store without label (yd/m, mile/km)
    @Column(name = "distance", nullable = false, unique = false)
    private float distance;

    // user notes for workout (optional)
    @Column(name = "notes", nullable = true, unique = false)
    private String notes;

    @Column(name = "type", nullable = true, unique = false)
    private WorkoutType type;

    @Column(name = "title", nullable = true, unique = false)
    private String title;

    // getters
    public User getUser(){
        return user;
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
    public WorkoutType getWorkoutType(){
        return type;
    }
    public String getWorkoutTitle(){
        return title;
    }

    // setters
    public void setUser(User newUser){
        this.user = newUser;
    }
    public void setWorkoutDiscipline(String newDiscipline){
        this.discipline = newDiscipline;
    }
    public void setWorkoutDate(LocalDate newDate){
        this.date = newDate;
    }
    public void setWorkoutDurationMinutes(int newDurationMin){
        this.durationMin = newDurationMin;
    }
    public void setWorkoutDistance(float newDistance){
        this.distance = newDistance;
    }
    public void setWorkoutNotes(String newNotes){
        this.notes = newNotes;
    }   
    public void setWorkoutType(WorkoutType newType){
        this.type = newType;
    }
    public void setWorkoutTitle(String newTitle){
        this.title = newTitle;
    }

}