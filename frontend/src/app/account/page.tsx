"use client";

import styles from "./account.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, PutRequest } from "@/lib/api-helper";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type PreferredRestDay =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
    experienceLevel: ExperienceLevel;
    weeklyTrainingDays: number;
    maxWeekdayHours: number;
    maxWeekendHours: number;
    preferredRestDay: PreferredRestDay;
}

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
    birthday?: string;
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

export default function AccountPage() {
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

    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        AuthGetRequest<UserProfile>("/api/profile").then((response) => {
            if (response.error) {
                if (response.error === "Profile not found") {
                    router.push("/profile");
                } else {
                    localStorage.removeItem("token");
                    router.push("/");
                }

                return;
            }

            if (response.data) {
                const profile = response.data;

                setMetric(profile.metric);
                setWeight(String(profile.weight));
                setHeight(String(profile.height));
                setExperienceLevel(profile.experienceLevel ?? "BEGINNER");
                setWeeklyTrainingDays(profile.weeklyTrainingDays ? String(profile.weeklyTrainingDays) : "");
                setMaxWeekdayHours(profile.maxWeekdayHours ? String(profile.maxWeekdayHours) : "");
                setMaxWeekendHours(profile.maxWeekendHours ? String(profile.maxWeekendHours) : "");
                setPreferredRestDay(profile.preferredRestDay ?? "MONDAY");
            }

            setLoading(false);
        });
    }, [router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setErrorMessage(null);
        setMessage(null);

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

        setSaving(true);

        const response = await PutRequest<{ message: string }>("/api/profile", {
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

        setSaving(false);

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

        setMessage("Profile updated successfully.");
    }

    if (loading) {
        return (
            <div className={shellStyles.loadingScreen}>
                <div className={shellStyles.loadingDot} />
                <div className={shellStyles.loadingDot} />
                <div className={shellStyles.loadingDot} />
            </div>
        );
    }

    return (
        <AppShell activePage="Account">
            <header className={styles.header}>
                <p className={styles.headerSub}>Manage your athlete data</p>
                <h1 className={styles.headerTitle}>Account</h1>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Profile Settings</h2>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                        {message && <div className={styles.success}>{message}</div>}

                        <div className={styles.toggleGroup}>
                            <span className={styles.fieldLabel}>Units</span>

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
                                <label className={styles.fieldLabel}>Height (cm)</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className={styles.twoColumn}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Feet</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        min={1}
                                        value={feet}
                                        onChange={(e) => setFeet(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Inches</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        min={0}
                                        max={11}
                                        value={inches}
                                        onChange={(e) => setInches(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Weight ({metric ? "kg" : "lbs"})</label>
                            <input
                                className={styles.inputField}
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Date of Birth</label>
                            <input
                                className={styles.inputField}
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                required
                            />
                        </div>

                        <h2 className={styles.sectionTitle}>Training Availability</h2>

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

                        <button className={styles.primaryButton} type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>
            </section>
        </AppShell>
    );
}