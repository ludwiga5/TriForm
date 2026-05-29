package entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Period;
import java.time.DayOfWeek;

//Handles User Entity
@Entity
@Table(name = "Profiles")
public class UserProfile extends BaseEntity{

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // true-metric false-imperial
    @Column(name = "metric", nullable = false, unique = false)
    private boolean metric;

    @Column(name = "height",nullable = false, unique = false)
    private float height;

    @Column(name = "weight",nullable = false, unique = false)
    private float weight;

    @Column(name = "age",nullable = false, unique = false)
    private int age;

    @Column(name = "experience_level", nullable = true, unique = false)
    private ExperienceLevel experienceLevel;

    @Column(name = "weekly_training_days", nullable = true, unique = false)
    private Integer weeklyTrainingDays;

    @Column(name = "max_weekday_hours", nullable = true, unique = false)
    private Integer maxWeekdayHours;

    @Column(name = "max_weekend_hours", nullable = true, unique = false)
    private Integer maxWeekendHours;

    @Column(name = "preferred_rest_day", nullable = true, unique = false)
    private DayOfWeek preferredRestDay;

    // Get Methods
    public User getUser(){
        return user;
    }
    public boolean getMetric(){
        return metric;
    }

    public float getHeight(){
        return height;
    }

    public float getWeight(){
        return weight;
    }

    public int getAge(){
        return age;
    }

    public ExperienceLevel getExperienceLevel(){
        return experienceLevel;
    }

    public Integer getWeeklyTrainingDays(){
        return weeklyTrainingDays;
    }

    public Integer getMaxWeekdayHours(){
        return maxWeekdayHours;
    }

    public Integer getMaxWeekendHours(){
        return maxWeekendHours;
    }

    public DayOfWeek getPreferredRestDay(){
        return preferredRestDay;
    }

    // Set Methods
    public void setUser(User user){
        this.user = user;
    }
    
    public void setMetric(boolean metric){
        this.metric = metric;
    }

    public void setHeight(float cm){
        this.height = cm;
    }

    public void setWeight(float weight){
        this.weight = weight;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel){
        this.experienceLevel = experienceLevel;
    }

    public void setWeeklyTrainingDays(Integer weeklyTrainingDays){
        this.weeklyTrainingDays = weeklyTrainingDays;
    }

    public void setMaxWeekdayHours(Integer maxWeekdayHours){
        this.maxWeekdayHours = maxWeekdayHours;
    }

    public void setMaxWeekendHours(Integer maxWeekendHours){
        this.maxWeekendHours = maxWeekendHours;
    }

    public void setPreferredRestDay(DayOfWeek preferredRestDay){
        this.preferredRestDay = preferredRestDay;
    }    

    //Takes birthday from profile & calculates age
    public void setAge(LocalDate birthday){ 
        LocalDate currentDate = LocalDate.now();
        Period newAge = Period.between(birthday, currentDate);
        age = newAge.getYears();
    }

}
