package services;

import entities.UserProfile;
import repositories.UserProfileRepository;

import org.springframework.stereotype.Service;

import dto.UserProfileRequest;
import entities.User;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository){
        this.userProfileRepository = userProfileRepository;
    }
    
    public void createUserProfile(User user, UserProfileRequest data) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setMetric(data.getMetric());
        profile.setHeight(data.getHeight()); // always cm from frontend
        profile.setWeight(data.getWeight());
        profile.setAge(data.getBirthday());
        userProfileRepository.save(profile);
    }

    public void updateUserProfile(UserProfile profile, UserProfileRequest data) {
        profile.setMetric(data.getMetric());
        profile.setWeight(data.getWeight());
        profile.setHeight(data.getHeight());
        profile.setAge(data.getBirthday());
        userProfileRepository.save(profile);
    }
}
