package entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Period;

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


    // Set Methods
    public void setUser(User newUser){
        user = newUser;
    }
    
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
    public void setAge(LocalDate birthday){ 
        LocalDate currentDate = LocalDate.now();
        Period newAge = Period.between(birthday, currentDate);
        age = newAge.getYears();
    }

}
