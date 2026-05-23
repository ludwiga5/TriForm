package services;

import entities.UserProfile;
import repositories.UserProfileRepository;
import entities.User;

public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository){
        this.userProfileRepository = userProfileRepository;
    }
    
    public void createUserProfile(User user, UserProfile profile){
        profile.setUser(user);
        userProfileRepository.save(profile);
    }


}
