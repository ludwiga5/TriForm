"use client";

import styles from "./profile.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPostRequest } from "@/lib/api-helper";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type PreferredRestDay =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

interface ProfileResponse {
    message: string;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
];

const REST_DAYS: { value: PreferredRestDay; label: string }[] = [
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
    { value: "SATURDAY", label: "Saturday" },
    { value: "SUNDAY", label: "Sunday" },
];

export default function ProfileSetupPage() {
    const router = useRouter();

    const [metric, setMetric] = useState(true);
    const [height, setHeight] = useState("");
    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");
    const [weight, setWeight] = useState("");
    const [birthday, setBirthday] = useState("");

    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("BEGINNER");
    const [weeklyTrainingDays, setWeeklyTrainingDays] = useState("");
    const [maxWeekdayHours, setMaxWeekdayHours] = useState("");
    const [maxWeekendHours, setMaxWeekendHours] = useState("");
    const [preferredRestDay, setPreferredRestDay] = useState<PreferredRestDay>("MONDAY");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        setCheckingAuth(false);
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);

        const heightInCm = metric
            ? parseFloat(height)
            : (parseInt(feet) * 12 + parseInt(inches)) * 2.54;

        const weightValue = parseFloat(weight);
        const trainingDaysValue = parseInt(weeklyTrainingDays);
        const maxWeekdayHoursValue = parseInt(maxWeekdayHours);
        const maxWeekendHoursValue = parseInt(maxWeekendHours);

        if (Number.isNaN(heightInCm) || heightInCm <= 0) {
            setErrorMessage("Enter a valid height.");
            return;
        }

        if (Number.isNaN(weightValue) || weightValue <= 0) {
            setErrorMessage("Enter a valid weight.");
            return;
        }

        if (!birthday) {
            setErrorMessage("Enter your date of birth.");
            return;
        }

        if (Number.isNaN(trainingDaysValue) || trainingDaysValue < 1 || trainingDaysValue > 7) {
            setErrorMessage("Training days must be between 1 and 7.");
            return;
        }

        if (Number.isNaN(maxWeekdayHoursValue) || maxWeekdayHoursValue < 1) {
            setErrorMessage("Enter your max weekday training hours.");
            return;
        }

        if (Number.isNaN(maxWeekendHoursValue) || maxWeekendHoursValue < 1) {
            setErrorMessage("Enter your max weekend training hours.");
            return;
        }

        setLoading(true);

        const response = await AuthPostRequest<ProfileResponse>("/api/profile", {
            metric,
            height: heightInCm,
            weight: weightValue,
            birthday,
            experienceLevel,
            weeklyTrainingDays: trainingDaysValue,
            maxWeekdayHours: maxWeekdayHoursValue,
            maxWeekendHours: maxWeekendHoursValue,
            preferredRestDay,
        });

        setLoading(false);

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

        if (response.data) {
            router.push("/dashboard");
        }
    }

    if (checkingAuth) {
        return null;
    }

    return (
        <div className={styles.page}>
            <main className={styles.shell}>
                <section className={styles.hero}>
                    <p className={styles.kicker}>Athlete Profile</p>
                    <h1>Set Up Profile</h1>
                    <p className={styles.subtitle}>
                        Tell us about yourself so TriForm can build better training tools around your stats.
                    </p>
                </section>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.profileForm}>
                        <h2>Your Stats</h2>

                        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

                        <div className={styles.toggleGroup}>
                            <span className={styles.toggleLabel}>Units *</span>

                            <div className={styles.toggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleOption} ${metric ? styles.toggleActive : ""}`}
                                    onClick={() => setMetric(true)}
                                >
                                    Metric
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.toggleOption} ${!metric ? styles.toggleActive : ""}`}
                                    onClick={() => setMetric(false)}
                                >
                                    Imperial
                                </button>
                            </div>
                        </div>

                        {metric ? (
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Height (cm) *</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    placeholder="e.g. 178"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className={styles.inlineGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Feet *</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        placeholder="5"
                                        value={feet}
                                        onChange={(e) => setFeet(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Inches *</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        placeholder="10"
                                        value={inches}
                                        onChange={(e) => setInches(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                Weight ({metric ? "kg" : "lbs"}) *
                            </label>
                            <input
                                className={styles.inputField}
                                type="number"
                                step="0.1"
                                placeholder={metric ? "e.g. 72" : "e.g. 160"}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Date of Birth *</label>
                            <input
                                className={styles.inputField}
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                required
                            />
                        </div>

                        <h1>Training Availability</h1>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Experience Level *</label>
                            <select
                                className={styles.inputField}
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                                required
                            >
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Weekly Training Days *</label>
                            <input
                                className={styles.inputField}
                                type="number"
                                min="1"
                                max="7"
                                placeholder="e.g. 5"
                                value={weeklyTrainingDays}
                                onChange={(e) => setWeeklyTrainingDays(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inlineGrid}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Max Weekday Hours *</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 1"
                                    value={maxWeekdayHours}
                                    onChange={(e) => setMaxWeekdayHours(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Max Weekend Hours *</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 2"
                                    value={maxWeekendHours}
                                    onChange={(e) => setMaxWeekendHours(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Preferred Rest Day *</label>
                            <select
                                className={styles.inputField}
                                value={preferredRestDay}
                                onChange={(e) => setPreferredRestDay(e.target.value as PreferredRestDay)}
                                required
                            >
                                {REST_DAYS.map((day) => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className={styles.submitButton} type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Finish Setup"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}