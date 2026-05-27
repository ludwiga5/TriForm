package entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "RaceGoals")
public class RaceGoal extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "race_name", nullable = false)
    private String raceName;

    @Column(name = "race_day", nullable = false)
    private LocalDate raceDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "race_type", nullable = false)
    private RaceType raceType;

    @Column(name = "location", nullable = true)
    private String location;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate = LocalDate.now();

    //LATER ADD goalTime, priority, status, notes

    public User getUser() {
        return user;
    }

    public String getRaceName() {
        return raceName;
    }

    public LocalDate getRaceDay() {
        return raceDay;
    }

    public RaceType getRaceType() {
        return raceType;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRaceName(String raceName) {
        this.raceName = raceName;
    }

    public void setRaceDay(LocalDate raceDay) {
        this.raceDay = raceDay;
    }

    public void setRaceType(RaceType raceType) {
        this.raceType = raceType;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }
}