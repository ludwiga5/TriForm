package TriForm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import entities.WorkoutType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import repositories.PlannedWorkoutRepository;
import repositories.RaceGoalRepository;
import repositories.TrainingPlanRepository;
import repositories.UserProfileRepository;
import repositories.UserRepository;
import repositories.WorkoutRepository;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    classes = TriFormApplication.class,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:triformtest;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=false",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "jwt.secret=test-secret-test-secret-test-secret-test-secret-123456789",
        "jwt.expiration-ms=3600000"
    }
)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TriFormApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlannedWorkoutRepository plannedWorkoutRepository;

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    @Autowired
    private RaceGoalRepository raceGoalRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void resetDatabase() {
        plannedWorkoutRepository.deleteAllInBatch();
        trainingPlanRepository.deleteAllInBatch();
        raceGoalRepository.deleteAllInBatch();
        workoutRepository.deleteAllInBatch();
        userProfileRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void registerCreatesUser() throws Exception {
        mockMvc.perform(post("/account/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "username", "alex",
                        "email", "alex@test.com",
                        "password", "password123"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User created successfully")));

        assertTrue(userRepository.existsByUsername("alex"));
        assertTrue(userRepository.existsByEmail("alex@test.com"));
    }

    @Test
    void registerRejectsDuplicateUsername() throws Exception {
        register("alex", "alex1@test.com", "password123");

        mockMvc.perform(post("/account/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "username", "alex",
                        "email", "alex2@test.com",
                        "password", "password123"
                ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        register("alex1", "alex@test.com", "password123");

        mockMvc.perform(post("/account/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "username", "alex2",
                        "email", "alex@test.com",
                        "password", "password123"
                ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void loginWorksWithUsername() throws Exception {
        register("alex", "alex@test.com", "password123");

        mockMvc.perform(post("/account/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "identifier", "alex",
                        "password", "password123"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    void loginWorksWithEmail() throws Exception {
        register("alex", "alex@test.com", "password123");

        mockMvc.perform(post("/account/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "identifier", "alex@test.com",
                        "password", "password123"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        register("alex", "alex@test.com", "password123");

        mockMvc.perform(post("/account/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "identifier", "alex",
                        "password", "wrong-password"
                ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void protectedProfileRouteRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profileMissingReturnsNotFoundForValidUser() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");

        mockMvc.perform(get("/api/profile")
                .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("Profile not found")));
    }

    @Test
    void createProfileWorks() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");

        mockMvc.perform(post("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(profileBody(true, 180.5, 72.5, "2007-05-10"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/profile")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metric", is(true)))
                .andExpect(jsonPath("$.height", is(180.5)))
                .andExpect(jsonPath("$.weight", is(72.5)));
    }

    @Test
    void createProfileRejectsDuplicateProfile() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");

        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(profileBody(true, 181.0, 73.0, "2007-05-10"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("Profile already exists")));
    }

    @Test
    void updateProfileWorks() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(put("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(profileBody(false, 177.8, 160.5, "2007-05-10"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/profile")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metric", is(false)))
                .andExpect(jsonPath("$.height", is(177.8)))
                .andExpect(jsonPath("$.weight", is(160.5)));
    }

    @Test
    void workoutListStartsEmpty() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));
    }

    @Test
    void createWorkoutWorksWithTitleAndType() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/workout")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(workoutBody(
                        "Morning Tempo Run",
                        "Run",
                        "TEMPO",
                        "2026-05-27",
                        45,
                        8.5,
                        "Felt controlled"
                ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].workoutTitle", is("Morning Tempo Run")))
                .andExpect(jsonPath("$[0].workoutType", is("TEMPO")))
                .andExpect(jsonPath("$[0].workoutDiscipline", is("Run")))
                .andExpect(jsonPath("$[0].workoutDurationMinutes", is(45)))
                .andExpect(jsonPath("$[0].workoutDistance", is(8.5)));
    }

    @Test
    void workoutDistancePreservesDecimals() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long workoutId = createWorkout(
                token,
                "Short Run",
                "Run",
                "EASY",
                "2026-05-27",
                25,
                3.3,
                "Decimal test"
        );

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is((int) workoutId)))
                .andExpect(jsonPath("$[0].workoutDistance", is(3.3)));
    }

    @Test
    void updateWorkoutWorks() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long workoutId = createWorkout(
                token,
                "Easy Run",
                "Run",
                "EASY",
                "2026-05-27",
                30,
                5.0,
                "Original"
        );

        mockMvc.perform(put("/api/workout/" + workoutId)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(workoutBody(
                        "Updated Tempo Run",
                        "Run",
                        "TEMPO",
                        "2026-05-28",
                        50,
                        9.4,
                        "Updated notes"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].workoutTitle", is("Updated Tempo Run")))
                .andExpect(jsonPath("$[0].workoutType", is("TEMPO")))
                .andExpect(jsonPath("$[0].workoutDate", is("2026-05-28")))
                .andExpect(jsonPath("$[0].workoutDurationMinutes", is(50)))
                .andExpect(jsonPath("$[0].workoutDistance", is(9.4)))
                .andExpect(jsonPath("$[0].workoutNotes", is("Updated notes")));
    }

    @Test
    void deleteWorkoutWorks() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long workoutId = createWorkout(
                token,
                "Easy Bike",
                "Bike",
                "EASY",
                "2026-05-27",
                60,
                25.5,
                "Delete test"
        );

        mockMvc.perform(delete("/api/workout/" + workoutId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));
    }

    @Test
    void userCannotEditAnotherUsersWorkout() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        long alexWorkoutId = createWorkout(
                alexToken,
                "Alex Workout",
                "Run",
                "EASY",
                "2026-05-27",
                30,
                5.0,
                "Private"
        );

        mockMvc.perform(put("/api/workout/" + alexWorkoutId)
                .header("Authorization", bearer(samToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(workoutBody(
                        "Stolen Workout",
                        "Bike",
                        "RACE",
                        "2026-05-28",
                        90,
                        40.0,
                        "Should not work"
                ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotDeleteAnotherUsersWorkout() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        long alexWorkoutId = createWorkout(
                alexToken,
                "Alex Workout",
                "Run",
                "EASY",
                "2026-05-27",
                30,
                5.0,
                "Private"
        );

        mockMvc.perform(delete("/api/workout/" + alexWorkoutId)
                .header("Authorization", bearer(samToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(alexToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)));
    }

    @Test
    void invalidWorkoutDateReturnsBadRequest() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/workout")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Bad Date",
                      "discipline": "Run",
                      "type": "EASY",
                      "date": "not-a-date",
                      "durationMin": 30,
                      "distance": 5.0,
                      "notes": "Should fail"
                    }
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidProfileBirthdayReturnsBadRequest() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");

        mockMvc.perform(post("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "metric": true,
                      "height": 180.0,
                      "weight": 72.0,
                      "birthday": "not-a-date"
                    }
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void corsPreflightIsAllowed() throws Exception {
        mockMvc.perform(options("/api/profile")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    void generateSprintTrainingPlanCreatesRaceGoalPlanAndWorkouts() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/plans/generate")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(planBody(
                        "Local Sprint Triathlon",
                        "SPRINT",
                        "2027-09-20",
                        "Syracuse, NY"
                ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.raceGoalId", notNullValue()))
                .andExpect(jsonPath("$.raceName", is("Local Sprint Triathlon")))
                .andExpect(jsonPath("$.raceType", is("SPRINT")))
                .andExpect(jsonPath("$.raceDay", is("2027-09-20")))
                .andExpect(jsonPath("$.location", is("Syracuse, NY")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.startDate", is("2027-07-12")))
                .andExpect(jsonPath("$.endDate", is("2027-09-20")))
                .andExpect(jsonPath("$.totalWorkouts", is(70)))
                .andExpect(jsonPath("$.workouts.length()", is(70)))
                .andExpect(jsonPath("$.workouts[0].title", is("Easy Run")))
                .andExpect(jsonPath("$.workouts[0].discipline", is("Run")))
                .andExpect(jsonPath("$.workouts[0].type", is("EASY")))
                .andExpect(jsonPath("$.workouts[0].weekNumber", is(1)))
                .andExpect(jsonPath("$.workouts[0].completed", is(false)));
    }

    @Test
    void generatedPlanAppearsInPlanList() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        generatePlan(token, "Local Sprint Triathlon", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(get("/api/plans")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].raceGoalId", notNullValue()))
                .andExpect(jsonPath("$[0].raceName", is("Local Sprint Triathlon")))
                .andExpect(jsonPath("$[0].raceType", is("SPRINT")))
                .andExpect(jsonPath("$[0].raceDay", is("2027-09-20")))
                .andExpect(jsonPath("$[0].location", is("Syracuse, NY")))
                .andExpect(jsonPath("$[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$[0].totalWorkouts", is(70)));
    }

    @Test
    void getPlanDetailsReturnsFullPlanAndWorkouts() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long planId = generatePlan(token, "Olympic Build", "OLYMPIC", "2027-09-20", "Rochester, NY");

        mockMvc.perform(get("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is((int) planId)))
                .andExpect(jsonPath("$.raceName", is("Olympic Build")))
                .andExpect(jsonPath("$.raceType", is("OLYMPIC")))
                .andExpect(jsonPath("$.raceDay", is("2027-09-20")))
                .andExpect(jsonPath("$.location", is("Rochester, NY")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.totalWorkouts", is(98)))
                .andExpect(jsonPath("$.workouts.length()", is(98)))
                .andExpect(jsonPath("$.workouts[0].scheduledDate", is("2027-06-14")))
                .andExpect(jsonPath("$.workouts[6].scheduledDate", is("2027-06-20")))
                .andExpect(jsonPath("$.workouts[7].weekNumber", is(2)));
    }

    @Test
    void userCannotViewAnotherUsersTrainingPlan() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        long alexPlanId = generatePlan(alexToken, "Alex Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(get("/api/plans/" + alexPlanId)
                .header("Authorization", bearer(samToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotDeleteAnotherUsersTrainingPlan() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        long alexPlanId = generatePlan(alexToken, "Alex Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(delete("/api/plans/" + alexPlanId)
                .header("Authorization", bearer(samToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/plans")
                .header("Authorization", bearer(alexToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)));
    }

    @Test
    void deleteTrainingPlanWorks() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long planId = generatePlan(token, "Delete Me Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(delete("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", notNullValue()));

        mockMvc.perform(get("/api/plans")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));
    }

    @Test
    void getMissingTrainingPlanReturnsNotFound() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(get("/api/plans/99999")
                .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void planListOnlyShowsCurrentUsersPlans() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        generatePlan(alexToken, "Alex Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");
        generatePlan(samToken, "Sam Olympic", "OLYMPIC", "2027-10-15", "Buffalo, NY");

        mockMvc.perform(get("/api/plans")
                .header("Authorization", bearer(alexToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].raceName", is("Alex Sprint")));

        mockMvc.perform(get("/api/plans")
                .header("Authorization", bearer(samToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].raceName", is("Sam Olympic")));
    }

    @Test
    void generatingDifferentRaceTypesCreatesDifferentWorkoutCounts() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long sprintPlanId = generatePlan(token, "Sprint Plan", "SPRINT", "2027-09-20", "Syracuse, NY");
        long halfIronmanPlanId = generatePlan(token, "Half Ironman Plan", "HALF_IRONMAN", "2027-12-20", "Lake Placid, NY");

        mockMvc.perform(get("/api/plans/" + sprintPlanId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWorkouts", is(70)))
                .andExpect(jsonPath("$.workouts.length()", is(70)));

        mockMvc.perform(get("/api/plans/" + halfIronmanPlanId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWorkouts", is(140)))
                .andExpect(jsonPath("$.workouts.length()", is(140)));
    }

    @Test
    void generatedPlannedWorkoutsProgressWeekly() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long planId = generatePlan(token, "Sprint Progression", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(get("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workouts[0].title", is("Easy Run")))
                .andExpect(jsonPath("$.workouts[0].targetDurationMin", is(30)))
                .andExpect(jsonPath("$.workouts[0].targetDistance", is(3.0)))
                .andExpect(jsonPath("$.workouts[7].title", is("Easy Run")))
                .andExpect(jsonPath("$.workouts[7].weekNumber", is(2)))
                .andExpect(jsonPath("$.workouts[7].targetDurationMin", is(32)))
                .andExpect(jsonPath("$.workouts[7].targetDistance", greaterThan(3.0)));
    }

    @Test
    void generatingPlanWithInvalidDateReturnsBadRequest() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/plans/generate")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "raceName": "Bad Date Race",
                      "raceType": "SPRINT",
                      "raceDay": "not-a-date",
                      "location": "Nowhere"
                    }
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void generatingPlanWithTooSoonRaceDateReturnsBadRequest() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(post("/api/plans/generate")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(planBody(
                        "Too Soon Sprint",
                        "SPRINT",
                        "2026-06-01",
                        "Syracuse, NY"
                ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", notNullValue()));
    }

        @Test
        void todayPlannedWorkoutsReturnsEmptyListWhenNoWorkoutToday() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        generatePlan(token, "Future Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");

        mockMvc.perform(get("/api/plans/workouts/today")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));
        }

        @Test
        void weekPlannedWorkoutsReturnsWorkoutsInsideCurrentCalendarWeek() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        LocalDate today = LocalDate.now();
        LocalDate raceDay = today.plusWeeks(10);

        generatePlan(token, "Current Week Sprint", "SPRINT", raceDay.toString(), "Syracuse, NY");

        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        String response = mockMvc.perform(get("/api/plans/workouts/week")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode workouts = objectMapper.readTree(response);

        assertTrue(workouts.size() > 0);

        for (JsonNode workout : workouts) {
                LocalDate scheduledDate = LocalDate.parse(workout.get("scheduledDate").asText());

                assertTrue(
                !scheduledDate.isBefore(startOfWeek) && !scheduledDate.isAfter(endOfWeek),
                "Workout date should be inside the current calendar week"
                );
        }
        }

        @Test
        void todayPlannedWorkoutsReturnsMultipleWorkoutsForToday() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        LocalDate today = LocalDate.now();
        LocalDate raceDay = today.plusWeeks(10);

        long planId = generatePlan(token, "Today Sprint", "SPRINT", raceDay.toString(), "Syracuse, NY");

        mockMvc.perform(get("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workouts[0].scheduledDate", is(today.toString())));

        mockMvc.perform(get("/api/plans/workouts/today")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].scheduledDate", is(today.toString())))
                .andExpect(jsonPath("$[0].title", is("Easy Run")))
                .andExpect(jsonPath("$[0].completed", is(false)));
        }

        @Test
        void togglePlannedWorkoutCompleteMarksWorkoutCompleted() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long planId = generatePlan(token, "Toggle Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");
        long plannedWorkoutId = getFirstPlannedWorkoutId(token, planId);

        mockMvc.perform(put("/api/plans/workouts/" + plannedWorkoutId + "/toggle-complete")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is((int) plannedWorkoutId)))
                .andExpect(jsonPath("$.completed", is(true)));

        mockMvc.perform(get("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workouts[0].completed", is(true)));
        }

        @Test
        void togglePlannedWorkoutCompleteTwiceReturnsWorkoutToIncomplete() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        long planId = generatePlan(token, "Toggle Twice Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");
        long plannedWorkoutId = getFirstPlannedWorkoutId(token, planId);

        mockMvc.perform(put("/api/plans/workouts/" + plannedWorkoutId + "/toggle-complete")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(true)));

        mockMvc.perform(put("/api/plans/workouts/" + plannedWorkoutId + "/toggle-complete")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(false)));

        mockMvc.perform(get("/api/plans/" + planId)
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workouts[0].completed", is(false)));
        }

        @Test
        void userCannotToggleAnotherUsersPlannedWorkout() throws Exception {
        register("alex", "alex@test.com", "password123");
        register("sam", "sam@test.com", "password123");

        String alexToken = login("alex", "password123");
        String samToken = login("sam", "password123");

        createProfile(alexToken, true, 180.0, 72.0, "2007-05-10");
        createProfile(samToken, true, 170.0, 65.0, "2007-06-10");

        long alexPlanId = generatePlan(alexToken, "Alex Sprint", "SPRINT", "2027-09-20", "Syracuse, NY");
        long alexPlannedWorkoutId = getFirstPlannedWorkoutId(alexToken, alexPlanId);

        mockMvc.perform(put("/api/plans/workouts/" + alexPlannedWorkoutId + "/toggle-complete")
                .header("Authorization", bearer(samToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/plans/" + alexPlanId)
                .header("Authorization", bearer(alexToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workouts[0].completed", is(false)));
        }

        @Test
        void toggleMissingPlannedWorkoutReturnsNotFound() throws Exception {
        register("alex", "alex@test.com", "password123");
        String token = login("alex", "password123");
        createProfile(token, true, 180.0, 72.0, "2007-05-10");

        mockMvc.perform(put("/api/plans/workouts/99999/toggle-complete")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", notNullValue()));
        }

        @Test
        void plannedWorkoutRoutesRejectMissingToken() throws Exception {
        mockMvc.perform(get("/api/plans/workouts/today"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/plans/workouts/week"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/plans/workouts/1/toggle-complete")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
        }

    private void register(String username, String email, String password) throws Exception {
        mockMvc.perform(post("/account/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "username", username,
                        "email", email,
                        "password", password
                ))))
                .andExpect(status().isOk());
    }

    private String login(String identifier, String password) throws Exception {
        String response = mockMvc.perform(post("/account/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "identifier", identifier,
                        "password", password
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private void createProfile(String token, boolean metric, double height, double weight, String birthday) throws Exception {
        mockMvc.perform(post("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(profileBody(metric, height, weight, birthday))))
                .andExpect(status().isCreated());
    }

    private long createWorkout(
            String token,
            String title,
            String discipline,
            String type,
            String date,
            int durationMin,
            double distance,
            String notes
    ) throws Exception {
        mockMvc.perform(post("/api/workout")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(workoutBody(title, discipline, type, date, durationMin, distance, notes))))
                .andExpect(status().isCreated());

        String response = mockMvc.perform(get("/api/workout")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get(0).get("id").asLong();
    }

    private long generatePlan(
            String token,
            String raceName,
            String raceType,
            String raceDay,
            String location
    ) throws Exception {
        String response = mockMvc.perform(post("/api/plans/generate")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(planBody(raceName, raceType, raceDay, location))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("id").asLong();
    }

    private Map<String, Object> profileBody(boolean metric, double height, double weight, String birthday) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("metric", metric);
        body.put("height", height);
        body.put("weight", weight);
        body.put("birthday", birthday);
        return body;
    }

    private Map<String, Object> workoutBody(
            String title,
            String discipline,
            String type,
            String date,
            int durationMin,
            double distance,
            String notes
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", title);
        body.put("discipline", discipline);
        body.put("type", WorkoutType.valueOf(type));
        body.put("date", LocalDate.parse(date).toString());
        body.put("durationMin", durationMin);
        body.put("distance", distance);
        body.put("notes", notes);
        return body;
    }

    private Map<String, Object> planBody(
            String raceName,
            String raceType,
            String raceDay,
            String location
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("raceName", raceName);
        body.put("raceType", raceType);
        body.put("raceDay", raceDay);
        body.put("location", location);
        return body;
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private long getFirstPlannedWorkoutId(String token, long planId) throws Exception {
    String response = mockMvc.perform(get("/api/plans/" + planId)
            .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.workouts.length()", greaterThan(0)))
            .andReturn()
            .getResponse()
            .getContentAsString();

    JsonNode json = objectMapper.readTree(response);

    return json.get("workouts").get(0).get("id").asLong();
        }


}