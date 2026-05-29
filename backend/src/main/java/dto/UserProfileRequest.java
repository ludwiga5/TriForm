package dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

import entities.ExperienceLevel;

public class UserProfileRequest {
    
    private boolean metric;
    private float height;
    private float weight;
    private LocalDate birthday;
    private ExperienceLevel experienceLevel;
    private Integer weeklyTrainingDays;
    private Integer maxWeekdayHours;
    private Integer maxWeekendHours;
    private DayOfWeek preferredRestDay;
    // Get Methods

    public boolean getMetric(){
        return metric;
    }
    public float getHeight(){
        return height;
    }
    public float getWeight(){
        return weight;
    }

    public LocalDate getBirthday(){
        return birthday;
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
    public void setMetric(boolean newMetric){
        metric = newMetric;
    }
    public void setHeight(float cm){
        height = cm;
    }

    public void setWeight(float newWeight){
        weight = newWeight;
    }

    //Takes birthday from profile & calculates age
    public void setBirthday(LocalDate newBirthday){ 
        birthday = newBirthday;
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
}
