package entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "PlannedWorkouts")
public class PlannedWorkout extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "training_plan_id", nullable = false)
    private TrainingPlan trainingPlan;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Swim, Bike, Run
    @Column(name = "discipline", nullable = false, unique = false)
    private String discipline;

    // user-defined Date of workout
    @Column(name = "scheduled_date", nullable = false, unique = false)
    private LocalDate scheduledDate;

    @Column(name = "target_duration", nullable = false, unique = false)
    private int targetDurationMin;
    
    // store without label (yd/m, mile/km)
    @Column(name = "target_distance", nullable = false, unique = false)
    private float targetDistance;

    @Enumerated(EnumType.STRING) 
    @Column(name = "type", nullable = true, unique = false)
    private WorkoutType type;

    @Column(name = "title", nullable = true, unique = false)
    private String title;

    @Column(name = "notes", nullable = true)
    private String notes;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(name = "completed", nullable = false, unique = false)
    private Boolean completed;

    // getters
    public TrainingPlan getTrainingPlan() {
        return trainingPlan;
    }

    public User getUser() {
        return user;
    }

    public String getDiscipline() {
        return discipline;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public int getTargetDurationMin() {
        return targetDurationMin;
    }

    public float getTargetDistance() {
        return targetDistance;
    }

    public WorkoutType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getNotes() {
        return notes;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public boolean getCompleted() {
        return completed;
    }

    // setters
    public void setTrainingPlan(TrainingPlan trainingPlan) {
        this.trainingPlan = trainingPlan;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setDiscipline(String discipline) {
        this.discipline = discipline;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public void setTargetDurationMin(int targetDurationMin) {
        this.targetDurationMin = targetDurationMin;
    }

    public void setTargetDistance(float targetDistance) {
        this.targetDistance = targetDistance;
    }

    public void setType(WorkoutType type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setWeekNumber(int weekNumber) {
        this.weekNumber = weekNumber;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}