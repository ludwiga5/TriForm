"use client";

import styles from "./dashboard.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest } from "@/lib/api-helper";

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

const DISCIPLINES = [
    { key: "swim", label: "Swim", code: "SW" },
    { key: "bike", label: "Bike", code: "BK" },
    { key: "run", label: "Run", code: "RN" },
];

function distanceUnit(discipline: string, metric: boolean): string {
    if (discipline === "Swim") return metric ? "m" : "yd";
    return metric ? "km" : "mi";
}

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        Promise.all([
            AuthGetRequest<UserProfile>("/api/profile"),
            AuthGetRequest<Workout[]>("/api/workout"),
        ]).then(([profileRes, workoutsRes]) => {
            if (profileRes.error) {
                if (profileRes.error === "Profile not found") router.push("/profile");
                else {
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

            setLoading(false);
        });
    }, [router]);

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
                                : `${profile.weight} lbs · ${profile.height}"`}
                        </span>
                    </div>
                )}
            </header>

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
                                        {workout.workoutDiscipline.slice(0, 2).toUpperCase()}
                                    </span>

                                    <div className={styles.recentWorkoutInfo}>
                                        <div className={styles.recentWorkoutHeader}>
                                            <span className={styles.recentWorkoutTitle}>
                                                {workout.workoutTitle || `${workout.workoutDiscipline} Session`}
                                            </span>
                                            <span className={styles.recentWorkoutDate}>{workout.workoutDate}</span>
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
                        <a href="/progress" className={styles.panelButton}>View Analytics</a>
                    </div>
                </div>
            </section>
        </AppShell>
    );
}