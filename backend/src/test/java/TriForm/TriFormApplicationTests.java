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

import repositories.UserProfileRepository;
import repositories.UserRepository;
import repositories.WorkoutRepository;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

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

@SpringBootTest(classes = TriFormApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TriFormApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void resetDatabase() {
        workoutRepository.deleteAll();
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
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

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}