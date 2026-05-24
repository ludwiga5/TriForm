package dto;

import java.time.LocalDate;

public class WorkoutRequest {
    
    private String discipline;
    private LocalDate date;
    private int durationMin;
    private int distance;
    private String notes;

    // getters
    public String getDiscipline() { 
        return discipline; 
    }
    public LocalDate getDate() { 
        return date; 
    }
    public int getDurationMin() { 
        return durationMin; 
    }
    public int getDistance() { 
        return distance; 
    }
    public String getNotes() { 
        return notes; 
    }

    // setters
    public void setDiscipline(String discipline) { 
        this.discipline = discipline; 
    }
    public void setDate(LocalDate date) { 
        this.date = date; 
    }
    public void setDurationMin(int durationMin) { 
        this.durationMin = durationMin; 
    }
    public void setDistance(int distance) { 
        this.distance = distance; 
    }
    public void setNotes(String notes) { 
        this.notes = notes;
    }
}
