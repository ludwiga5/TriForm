package dto;

import java.time.LocalDate;

import entities.RaceType;

public class GeneratePlanRequest{

    private String raceName;
    private RaceType raceType;
    private LocalDate raceDay;
    private String location;

    // later experienceLevel, weeklyAvailability, goal

    public String getRaceName() {
        return raceName;
    }
    public RaceType getRaceType() {
        return raceType;
    }
    public LocalDate getRaceDay() {
        return raceDay;
    }
    public String getLocation() {
        return location;
    }

    public void setRaceName(String raceName) {
        this.raceName = raceName;
    }
    public void setRaceType(RaceType raceType) {
        this.raceType = raceType;
    }
    public void setRaceDay(LocalDate raceDay) {
        this.raceDay = raceDay;
    }
    public void setLocation(String location) {
        this.location = location;
    }
}