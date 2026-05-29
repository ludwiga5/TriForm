package dto;

import java.time.DayOfWeek;

import entities.ExperienceLevel;
import entities.UserProfile;

public class UserProfileResponse {
    private Long id;
    private boolean metric;
    private float height;
    private float weight;
    private int age;
    private ExperienceLevel experienceLevel;
    private Integer weeklyTrainingDays;
    private Integer maxWeekdayHours;
    private Integer maxWeekendHours;
    private DayOfWeek preferredRestDay;

    public UserProfileResponse(UserProfile profile) {
        this.id = profile.getId();
        this.metric = profile.getMetric();
        this.height = profile.getHeight();
        this.weight = profile.getWeight();
        this.age = profile.getAge();
        this.experienceLevel = profile.getExperienceLevel();
        this.weeklyTrainingDays = profile.getWeeklyTrainingDays();
        this.maxWeekdayHours = profile.getMaxWeekdayHours();
        this.maxWeekendHours = profile.getMaxWeekendHours();
        this.preferredRestDay = profile.getPreferredRestDay();
    }

    // Get Methods
    public Long getId(){
        return id;
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

}