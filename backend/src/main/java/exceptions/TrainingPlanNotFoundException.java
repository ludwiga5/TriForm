package exceptions;

public class TrainingPlanNotFoundException extends RuntimeException {

    public TrainingPlanNotFoundException(String message){
        super(message);
    }
    
}
