package entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;

//Handles User Entity
@Entity
@Table(name = "Profiles")
public class UserProfile extends BaseEntity{

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
    public void setAge(String birthday){ 

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate birthDate = LocalDate.parse(birthday, formatter);
        LocalDate currentDate = LocalDate.now();
        Period newAge = Period.between(birthDate, currentDate);
        age = newAge.getYears();
    }

}
