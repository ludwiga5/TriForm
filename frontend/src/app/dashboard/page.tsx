"use client";

import styles from "./dashboard.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, AuthPostRequest, PutRequest } from "@/lib/api-helper";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
}

interface Workout {
    id: number;
    workoutTitle?: string;
    workoutDiscipline: string;
    workoutDate: string;
    workoutDurationMinutes: number;
    workoutDistance: number;
    workoutNotes: string;
    workoutType?: string;
}

interface LogPlannedWorkoutRequest {
    durationMin: number;
    distance: number;
    notes: string;
}

type WorkoutType = "EASY" | "TEMPO" | "INTERVALS" | "LONG" | "RECOVERY" | "RACE";

interface PlannedWorkoutResponse {
    id: number;
    trainingPlanId: number;
    discipline: string;
    scheduledDate: string;
    targetDurationMin: number;
    targetDistance: number;
    type: WorkoutType;
    title: string;
    notes: string;
    weekNumber: number;
    completed: boolean;
}

const DISCIPLINES = [
    { key: "swim", label: "Swim", code: "SW" },
    { key: "bike", label: "Bike", code: "BK" },
    { key: "run", label: "Run", code: "RN" },
];

function formatImperialHeight(heightInCm: number): string {
    const totalInches = Math.round(heightInCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    return `${feet}'${inches}"`;
}

function distanceUnit(discipline: string, metric: boolean): string {
    if (discipline === "Swim") return metric ? "m" : "yd";
    return metric ? "km" : "mi";
}

function plannedDistanceUnit(discipline: string): string {
    if (discipline === "Swim") return "m";
    return "mi";
}

function disciplineCode(discipline: string): string {
    if (discipline === "Swim") return "SW";
    if (discipline === "Bike") return "BK";
    if (discipline === "Run") return "RN";
    return discipline.slice(0, 2).toUpperCase();
}

function formatDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function formatWeekday(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

export default function DashboardPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
    const [todayWorkouts, setTodayWorkouts] = useState<PlannedWorkoutResponse[]>([]);
    const [weekWorkouts, setWeekWorkouts] = useState<PlannedWorkoutResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        loadDashboard();
    }, [router]);

    async function loadDashboard() {
        setLoading(true);
        setErrorMessage(null);

        const [profileRes, workoutsRes, todayRes, weekRes] = await Promise.all([
            AuthGetRequest<UserProfile>("/api/profile"),
            AuthGetRequest<Workout[]>("/api/workout"),
            AuthGetRequest<PlannedWorkoutResponse[]>("/api/plans/workouts/today"),
            AuthGetRequest<PlannedWorkoutResponse[]>("/api/plans/workouts/week"),
        ]);

        if (profileRes.error) {
            if (profileRes.error === "Profile not found") {
                router.push("/profile");
            } else {
                localStorage.removeItem("token");
                router.push("/");
            }

            return;
        }

        setProfile(profileRes.data ?? null);

        if (workoutsRes.data) {
            const sorted = workoutsRes.data
                .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
                .slice(0, 5);

            setRecentWorkouts(sorted);
        }

        if (todayRes.data) {
            setTodayWorkouts(todayRes.data);
        }

        if (weekRes.data) {
            setWeekWorkouts(weekRes.data);
        }

        if (todayRes.error || weekRes.error) {
            setErrorMessage("Training plan workouts could not be loaded.");
        }

        setLoading(false);
    }

    async function handleToggleWorkoutComplete(workout: PlannedWorkoutResponse) {
        setErrorMessage(null);

        if (workout.completed) {
            const response = await PutRequest<PlannedWorkoutResponse>(
                `/api/plans/workouts/${workout.id}/toggle-complete`,
                {}
            );

            if (response.error) {
                setErrorMessage(response.error);
                return;
            }

            if (!response.data) return;

            const updatedWorkout = response.data;

            setTodayWorkouts((current) =>
                current.map((item) =>
                    item.id === updatedWorkout.id ? updatedWorkout : item
                )
            );

            setWeekWorkouts((current) =>
                current.map((item) =>
                    item.id === updatedWorkout.id ? updatedWorkout : item
                )
            );

            return;
        }

        const response = await AuthPostRequest<Workout>(
            `/api/plans/workouts/${workout.id}/log`,
            {
                durationMin: workout.targetDurationMin,
                distance: workout.targetDistance,
                notes: workout.notes,
            } satisfies LogPlannedWorkoutRequest
        );

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

        const completedWorkout = {
            ...workout,
            completed: true,
        };

        setTodayWorkouts((current) =>
            current.map((item) =>
                item.id === workout.id ? completedWorkout : item
            )
        );

        setWeekWorkouts((current) =>
            current.map((item) =>
                item.id === workout.id ? completedWorkout : item
            )
        );

        if (response.data) {
            setRecentWorkouts((current) => {
                const withoutDuplicate = current.filter((item) => item.id !== response.data!.id);
                return [response.data!, ...withoutDuplicate]
                    .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
                    .slice(0, 5);
            });
        }
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
        <AppShell activePage="Dashboard">
            <header className={styles.header}>
                <div>
                    <p className={styles.headerSub}>Welcome back</p>
                    <h1 className={styles.headerTitle}>Dashboard</h1>
                </div>

                {profile && (
                    <div className={styles.profileBadge}>
                        <span className={styles.profileBadgeAge}>{profile.age} yrs</span>
                        <span className={styles.profileBadgeStat}>
                            {profile.metric
                                ? `${profile.weight} kg · ${profile.height} cm`
                                : `${profile.weight} lbs · ${formatImperialHeight(profile.height)}`}
                        </span>
                    </div>
                )}
            </header>

            {errorMessage && (
                <div className={styles.error}>
                    {errorMessage}
                </div>
            )}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Today</h2>

                {todayWorkouts.length === 0 ? (
                    <div className={styles.emptyState}>
                        No planned workouts today.
                    </div>
                ) : (
                    <div className={styles.todayWorkoutList}>
                        {todayWorkouts.map((workout) => (
                            <div
                                key={workout.id}
                                className={`${styles.todayWorkoutCard} ${workout.completed ? styles.todayWorkoutCardCompleted : ""}`}
                            >
                                <div className={styles.todayWorkoutTop}>
                                    <span className={styles.todayWorkoutIcon}>
                                        {disciplineCode(workout.discipline)}
                                    </span>

                                    <div className={styles.todayWorkoutInfo}>
                                        <span className={styles.todayWorkoutTitle}>{workout.title}</span>
                                        <span className={styles.todayWorkoutMeta}>
                                            {workout.type} · {workout.targetDurationMin} min · {workout.targetDistance} {plannedDistanceUnit(workout.discipline)}
                                        </span>
                                    </div>
                                </div>

                                {workout.notes && (
                                    <p className={styles.todayWorkoutNotes}>{workout.notes}</p>
                                )}

                                <button
                                    className={workout.completed ? styles.completedButton : styles.completeButton}
                                    onClick={() => handleToggleWorkoutComplete(workout)}
                                    type="button"
                                >
                                    {workout.completed ? "Undo Complete" : "Mark Complete"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>This Week</h2>

                {weekWorkouts.length === 0 ? (
                    <div className={styles.emptyState}>
                        No planned workouts this week.
                    </div>
                ) : (
                    <div className={styles.weekWorkoutList}>
                        {weekWorkouts.map((workout) => (
                            <div
                                key={workout.id}
                                className={`${styles.weekWorkoutRow} ${workout.completed ? styles.weekWorkoutRowCompleted : ""}`}
                            >
                                <span className={styles.weekWorkoutDate}>{formatWeekday(workout.scheduledDate)}</span>
                                <span className={styles.weekWorkoutIcon}>{disciplineCode(workout.discipline)}</span>

                                <div className={styles.weekWorkoutInfo}>
                                    <span className={styles.weekWorkoutTitle}>{workout.title}</span>
                                    <span className={styles.weekWorkoutMeta}>
                                        {workout.type} · {workout.targetDurationMin} min · {workout.targetDistance} {plannedDistanceUnit(workout.discipline)}
                                    </span>
                                </div>

                                <button
                                    className={workout.completed ? styles.smallCompletedButton : styles.smallCompleteButton}
                                    onClick={() => handleToggleWorkoutComplete(workout)}
                                    type="button"
                                >
                                    {workout.completed ? "Undo" : "Done"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Sessions</h2>

                {recentWorkouts.length === 0 ? (
                    <div className={styles.emptyState}>
                        No workouts logged yet. Start by logging your first swim, bike, or run.
                    </div>
                ) : (
                    <div className={styles.recentWorkoutList}>
                        {recentWorkouts.map((workout) => {
                            const unit = distanceUnit(workout.workoutDiscipline, profile?.metric ?? true);

                            return (
                                <div key={workout.id} className={styles.recentWorkoutRow}>
                                    <span className={styles.recentWorkoutIcon}>
                                        {disciplineCode(workout.workoutDiscipline)}
                                    </span>

                                    <div className={styles.recentWorkoutInfo}>
                                        <div className={styles.recentWorkoutHeader}>
                                            <span className={styles.recentWorkoutTitle}>
                                                {workout.workoutTitle || `${workout.workoutDiscipline} Session`}
                                            </span>
                                            <span className={styles.recentWorkoutDate}>
                                                {formatDate(workout.workoutDate)}
                                            </span>
                                        </div>

                                        <div className={styles.recentWorkoutStats}>
                                            {workout.workoutDurationMinutes} min · {workout.workoutDistance} {unit}
                                            {workout.workoutType ? ` · ${workout.workoutType}` : ""}
                                        </div>

                                        {workout.workoutNotes && (
                                            <div className={styles.recentWorkoutNotes}>{workout.workoutNotes}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Disciplines</h2>

                <div className={styles.disciplineGrid}>
                    {DISCIPLINES.map((discipline) => (
                        <div key={discipline.key} className={styles.disciplineCard}>
                            <span className={styles.disciplineIcon}>{discipline.code}</span>
                            <span className={styles.disciplineLabel}>{discipline.label}</span>
                            <span className={styles.disciplineComingSoon}>Tracking active</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Your Training</h2>

                <div className={styles.panelGrid}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>Training Plan</span>
                            <span className={styles.panelBadge}>Active</span>
                        </div>
                        <p className={styles.panelBody}>
                            Generate a personalized week-by-week triathlon plan based on your goal race.
                        </p>
                        <a href="/plan" className={styles.panelButton}>Open Plan</a>
                    </div>

                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>Log Workout</span>
                            <span className={styles.panelBadge}>Active</span>
                        </div>
                        <p className={styles.panelBody}>
                            Record your swim, bike, and run sessions with distance, duration, type, and notes.
                        </p>
                        <a href="/log" className={styles.panelButton}>Log Session</a>
                    </div>

                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>Progress</span>
                            <span className={styles.panelBadge}>Soon</span>
                        </div>
                        <p className={styles.panelBody}>
                            Track volume trends across disciplines and see how your training load builds over time.
                        </p>
                        <button className={styles.panelButton} disabled>
                            View Analytics
                        </button>
                    </div>
                </div>
            </section>
        </AppShell>
    );
}