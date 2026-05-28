"use client";

import styles from "./dashboard.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest } from "@/lib/api-helper";

type WorkoutType = "EASY" | "RECOVERY" | "TEMPO" | "INTERVALS" | "LONG" | "RACE";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
}

interface Workout {
    id: number;
    workoutTitle: string;
    workoutType: WorkoutType | null;
    workoutDiscipline: string;
    workoutDate: string;
    workoutDurationMinutes: number;
    workoutDistance: number;
    workoutNotes: string | null;
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Training Plan", href: "/plan", active: false },
    { label: "Log Workout", href: "/log", active: false },
    { label: "Progress", href: "/progress", active: false },
    { label: "Account", href: "/account", active: false },
];

const DISCIPLINES = [
    { key: "swim", label: "Swim" },
    { key: "bike", label: "Bike" },
    { key: "run", label: "Run" },
];

const DISCIPLINE_META: Record<string, { short: string; color: string }> = {
    Swim: { short: "SW", color: "#1a6fa3" },
    Bike: { short: "BK", color: "#992222" },
    Run: { short: "RN", color: "#2a7a4b" },
};

function distanceUnit(discipline: string, metric: boolean): string {
    if (discipline === "Swim") return metric ? "m" : "yd";
    return metric ? "km" : "mi";
}

function formatImperialHeight(heightCm: number): string {
    const totalInches = Math.round(heightCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    return `${feet}'${inches}"`;
}

function formatWorkoutType(type: WorkoutType | null): string {
    if (!type) return "Unspecified";

    return type
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
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
            if (profileRes.error === "Profile not found") {
                router.push("/profile");
                return;
            }

            if (profileRes.error || workoutsRes.error) {
                localStorage.removeItem("token");
                router.push("/");
                return;
            }

            setProfile(profileRes.data ?? null);

            const sortedWorkouts = (workoutsRes.data ?? [])
                .sort((a, b) => {
                    return new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime();
                })
                .slice(0, 5);

            setRecentWorkouts(sortedWorkouts);
            setLoading(false);
        });
    }, [router]);

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/");
    }

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <span className={styles.logoMark}>TF</span>
                    <span className={styles.logoText}>TriForm</span>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <a key={item.label} href={item.href} className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}>
                            {item.label}
                        </a>
                    ))}
                </nav>

                <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            <main className={styles.main}>
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
                                    ? `${profile.weight} kg · ${Math.round(profile.height)} cm`
                                    : `${profile.weight} lbs · ${formatImperialHeight(profile.height)}`}
                            </span>
                        </div>
                    )}
                </header>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Sessions</h2>

                    {recentWorkouts.length === 0 ? (
                        <p className={styles.emptyState}>No workouts logged yet. Start by logging your first session.</p>
                    ) : (
                        <div className={styles.recentWorkoutList}>
                            {recentWorkouts.map((workout) => {
                                const meta = DISCIPLINE_META[workout.workoutDiscipline] ?? { short: "TR", color: "#555" };
                                const unit = profile ? distanceUnit(workout.workoutDiscipline, profile.metric) : "";

                                return (
                                    <div key={workout.id} className={styles.recentWorkoutRow}>
                                        <span className={styles.recentWorkoutIcon} style={{ background: `${meta.color}22`, color: meta.color }}>
                                            {meta.short}
                                        </span>

                                        <div className={styles.recentWorkoutInfo}>
                                            <div className={styles.recentWorkoutHeader}>
                                                <span className={styles.recentWorkoutTitle}>
                                                    {workout.workoutTitle || workout.workoutDiscipline}
                                                </span>
                                                <span className={styles.recentWorkoutDate}>{workout.workoutDate}</span>
                                            </div>

                                            <div className={styles.recentWorkoutStats}>
                                                {formatWorkoutType(workout.workoutType)} · {workout.workoutDiscipline} ·{" "}
                                                {workout.workoutDurationMinutes} min · {workout.workoutDistance} {unit}
                                            </div>

                                            {workout.workoutNotes && <div className={styles.recentWorkoutNotes}>{workout.workoutNotes}</div>}
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
                                <span className={styles.disciplineIcon}>{DISCIPLINE_META[discipline.label].short}</span>
                                <span className={styles.disciplineLabel}>{discipline.label}</span>
                                <span className={styles.disciplineComingSoon}>Structured training support</span>
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
                            <a href="/plan" className={styles.panelButton}>
                                Open Plan
                            </a>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>Log Workout</span>
                                <span className={styles.panelBadge}>Live</span>
                            </div>

                            <p className={styles.panelBody}>
                                Record swim, bike, and run sessions with discipline, workout type, distance, duration, and notes.
                            </p>

                            <a href="/log" className={styles.panelButton}>
                                Log Session
                            </a>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>Progress</span>
                                <span className={styles.panelBadge}>Soon</span>
                            </div>

                            <p className={styles.panelBody}>
                                Track volume trends, training consistency, and planned versus completed workout progress.
                            </p>

                            <button className={styles.panelButton} disabled>
                                View Analytics
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}