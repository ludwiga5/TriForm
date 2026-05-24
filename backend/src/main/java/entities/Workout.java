package entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Workouts")
public class Workout extends BaseEntity{
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "discipline", nullable = false, unique = false)
    private String discipline;

    @Column(name = "date", nullable = false, unique = false)
    private LocalDate date;

    @Column(name = "duration", nullable = false, unique = false)
    private int durationMin;
    
    @Column(name = "distance", nullable = false, unique = false)
    private int distance;

    @Column(name = "notes", nullable = true, unique = false)
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
