package dto;

import java.time.LocalDate;

public class UserProfileRequest {
    
    private boolean metric;
    private float height;
    private float weight;
    private LocalDate birthday;

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
    public void setBirthday(LocalDate newBirthday){ 
        birthday = newBirthday;
    }
}
