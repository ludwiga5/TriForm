package dto;

import entities.UserProfile;

public class UserProfileResponse {
    private Long id;
    private boolean metric;
    private float height;
    private float weight;
    private int age;

    public UserProfileResponse(UserProfile profile) {
        this.id = profile.getId();
        this.metric = profile.getMetric();
        this.height = profile.getHeight();
        this.weight = profile.getWeight();
        this.age = profile.getAge();
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

}