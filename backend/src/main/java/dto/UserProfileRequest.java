package dto;

import java.time.LocalDate;
import java.time.Period;

import entities.User;

public class UserProfileRequest {
    
    private User user;
    private boolean metric;
    private float height;
    private float weight;
    private int age;
    private LocalDate birthday;

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
    public LocalDate getBirthday(){
        return birthday;
    }

    // Set Methods
    public void setUser(User newUser){
        user = newUser;
    }
    public void setMetric(boolean newMetric){
        metric = newMetric;
    }
    public void setHeight(int cm){
        height = cm;
    }
    public void setHeight(int feet, int inches){
        float newHeight = feet*12+inches;
        height = (float)(newHeight*2.54);
    }

    public void setWeight(float newWeight){
        weight = newWeight;
    }

    //Takes birthday from profile & calculates age
    public void setAge(LocalDate birthday){ 
        LocalDate currentDate = LocalDate.now();
        Period newAge = Period.between(birthday, currentDate);
        age = newAge.getYears();
    }
}
