"use client";

import styles from "./progress.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest } from "@/lib/api-helper";

type RaceType = "SPRINT" | "OLYMPIC" | "HALF_IRONMAN" | "FULL_IRONMAN";
type PlanStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
type WorkoutType = "EASY" | "TEMPO" | "INTERVALS" | "LONG" | "RECOVERY" | "RACE";
type PlannedWorkoutStatus = "completed" | "missed" | "upcoming";

interface TrainingPlanResponse {
    id: number;
    raceGoalId: number;
    raceName: string;
    raceType: RaceType;
    raceDay: string;
    location: string;
    status: PlanStatus;
    startDate: string;
    endDate: string;
    createdDate: string;
    totalWorkouts: number;
}

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

interface TrainingPlanDetailResponse extends TrainingPlanResponse {
    workouts: PlannedWorkoutResponse[];
}

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

interface WeekSummary {
    weekStart: string;
    weekEnd: string;
    totalMinutes: number;
    workoutCount: number;
    swimDistance: number;
    bikeDistance: number;
    runDistance: number;
}

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

function getPlannedWorkoutStatus(workout: PlannedWorkoutResponse): PlannedWorkoutStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledDate = new Date(`${workout.scheduledDate}T00:00:00`);

    if (workout.completed) return "completed";
    if (scheduledDate < today) return "missed";

    return "upcoming";
}

function formatPlannedWorkoutStatus(status: PlannedWorkoutStatus): string {
    if (status === "completed") return "Completed";
    if (status === "missed") return "Missed";
    return "Upcoming";
}

const DISCIPLINES = ["Swim", "Bike", "Run"];

function formatDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;

    return `${hours}h ${remainingMinutes}m`;
}

function startOfWeek(date: Date): Date {
    const copied = new Date(date);
    const day = copied.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    copied.setDate(copied.getDate() + diff);
    copied.setHours(0, 0, 0, 0);

    return copied;
}

function dateToKey(date: Date): string {
    return date.toISOString().split("T")[0];
}

function getWeekRange(offsetWeeks: number): { start: Date; end: Date } {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + offsetWeeks * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
}

function isWorkoutInRange(workout: Workout, start: Date, end: Date): boolean {
    const workoutDate = new Date(`${workout.workoutDate}T00:00:00`);

    return workoutDate >= start && workoutDate <= end;
}

function distanceUnit(discipline: string, metric: boolean): string {
    if (discipline === "Swim") return metric ? "m" : "yd";
    return metric ? "km" : "mi";
}

function disciplineCode(discipline: string): string {
    if (discipline === "Swim") return "SW";
    if (discipline === "Bike") return "BK";
    if (discipline === "Run") return "RN";
    return discipline.slice(0, 2).toUpperCase();
}

function roundDistance(distance: number): string {
    if (distance === 0) return "0";

    return distance.toFixed(1).replace(".0", "");
}

export default function ProgressPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkoutResponse[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        loadProgress();
    }, [router]);

    async function loadProgress() {
        setLoading(true);
        setErrorMessage(null);

        const [profileRes, workoutsRes, plansRes] = await Promise.all([
            AuthGetRequest<UserProfile>("/api/profile"),
            AuthGetRequest<Workout[]>("/api/workout"),
            AuthGetRequest<TrainingPlanResponse[]>("/api/plans"),
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

        if (workoutsRes.error) {
            setErrorMessage(workoutsRes.error);
            setLoading(false);
            return;
        }

        setProfile(profileRes.data ?? null);
        setWorkouts(workoutsRes.data ?? []);

        if (plansRes.data && plansRes.data.length > 0) {
            const planDetailResponses = await Promise.all(
                plansRes.data.map((plan) =>
                    AuthGetRequest<TrainingPlanDetailResponse>(`/api/plans/${plan.id}`)
                )
            );

            const allPlannedWorkouts = planDetailResponses.flatMap(
                (response) => response.data?.workouts ?? []
            );

            setPlannedWorkouts(allPlannedWorkouts);
        } else {
            setPlannedWorkouts([]);
        }

        if (plansRes.error) {
            setErrorMessage("Planned workout progress could not be loaded.");
        }

        setLoading(false);
    }

    const sortedWorkouts = useMemo(() => {
        return [...workouts].sort(
            (a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()
        );
    }, [workouts]);

    const totalMinutes = useMemo(() => {
        return workouts.reduce((sum, workout) => sum + workout.workoutDurationMinutes, 0);
    }, [workouts]);

    const disciplineTotals = useMemo(() => {
        return DISCIPLINES.map((discipline) => {
            const disciplineWorkouts = workouts.filter(
                (workout) => workout.workoutDiscipline === discipline
            );

            return {
                discipline,
                count: disciplineWorkouts.length,
                minutes: disciplineWorkouts.reduce(
                    (sum, workout) => sum + workout.workoutDurationMinutes,
                    0
                ),
                distance: disciplineWorkouts.reduce(
                    (sum, workout) => sum + workout.workoutDistance,
                    0
                ),
            };
        });
    }, [workouts]);

    const currentWeek = useMemo(() => getWeekRange(0), []);
    const previousWeek = useMemo(() => getWeekRange(-1), []);

    const currentWeekWorkouts = useMemo(() => {
        return workouts.filter((workout) =>
            isWorkoutInRange(workout, currentWeek.start, currentWeek.end)
        );
    }, [workouts, currentWeek]);

    const previousWeekWorkouts = useMemo(() => {
        return workouts.filter((workout) =>
            isWorkoutInRange(workout, previousWeek.start, previousWeek.end)
        );
    }, [workouts, previousWeek]);

    const currentWeekMinutes = useMemo(() => {
        return currentWeekWorkouts.reduce(
            (sum, workout) => sum + workout.workoutDurationMinutes,
            0
        );
    }, [currentWeekWorkouts]);

    const previousWeekMinutes = useMemo(() => {
        return previousWeekWorkouts.reduce(
            (sum, workout) => sum + workout.workoutDurationMinutes,
            0
        );
    }, [previousWeekWorkouts]);

    const weeklySummaries = useMemo<WeekSummary[]>(() => {
        return [-5, -4, -3, -2, -1, 0].map((offset) => {
            const range = getWeekRange(offset);
            const weekWorkouts = workouts.filter((workout) =>
                isWorkoutInRange(workout, range.start, range.end)
            );

            return {
                weekStart: dateToKey(range.start),
                weekEnd: dateToKey(range.end),
                totalMinutes: weekWorkouts.reduce(
                    (sum, workout) => sum + workout.workoutDurationMinutes,
                    0
                ),
                workoutCount: weekWorkouts.length,
                swimDistance: weekWorkouts
                    .filter((workout) => workout.workoutDiscipline === "Swim")
                    .reduce((sum, workout) => sum + workout.workoutDistance, 0),
                bikeDistance: weekWorkouts
                    .filter((workout) => workout.workoutDiscipline === "Bike")
                    .reduce((sum, workout) => sum + workout.workoutDistance, 0),
                runDistance: weekWorkouts
                    .filter((workout) => workout.workoutDiscipline === "Run")
                    .reduce((sum, workout) => sum + workout.workoutDistance, 0),
            };
        });
    }, [workouts]);

    const maxWeeklyMinutes = useMemo(() => {
        return Math.max(...weeklySummaries.map((week) => week.totalMinutes), 1);
    }, [weeklySummaries]);

    const completedPlannedWorkouts = useMemo(() => {
        return plannedWorkouts.filter(
            (workout) => getPlannedWorkoutStatus(workout) === "completed"
        );
    }, [plannedWorkouts]);

    const missedPlannedWorkouts = useMemo(() => {
        return plannedWorkouts.filter(
            (workout) => getPlannedWorkoutStatus(workout) === "missed"
        );
    }, [plannedWorkouts]);

    const upcomingPlannedWorkouts = useMemo(() => {
        return plannedWorkouts.filter(
            (workout) => getPlannedWorkoutStatus(workout) === "upcoming"
        );
    }, [plannedWorkouts]);

    const completionRate = useMemo(() => {
        const decidedWorkouts = completedPlannedWorkouts.length + missedPlannedWorkouts.length;

        if (decidedWorkouts === 0) return 0;

        return Math.round((completedPlannedWorkouts.length / decidedWorkouts) * 100);
    }, [completedPlannedWorkouts, missedPlannedWorkouts]);

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
        <AppShell activePage="Progress">
            <header className={styles.header}>
                <div>
                    <p className={styles.headerSub}>Training analytics</p>
                    <h1 className={styles.headerTitle}>Progress</h1>
                </div>

                <div className={styles.headerBadge}>
                    <span className={styles.headerBadgeLabel}>Logged Workouts</span>
                    <span className={styles.headerBadgeValue}>{workouts.length}</span>
                </div>
            </header>

            {errorMessage && (
                <div className={styles.error}>
                    {errorMessage}
                </div>
            )}

            {workouts.length === 0 ? (
                <section className={styles.emptyPanel}>
                    <span className={styles.emptyIcon}>PR</span>
                    <h2 className={styles.emptyTitle}>No progress data yet</h2>
                    <p className={styles.emptyText}>
                        Complete planned workouts or log sessions manually to start building your training history.
                    </p>
                    <a href="/log" className={styles.emptyButton}>Log Workout</a>
                </section>
            ) : (
                <>
                    <section className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Total Workouts</span>
                            <span className={styles.summaryValue}>{workouts.length}</span>
                            <span className={styles.summaryMeta}>all logged sessions</span>
                        </div>

                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Training Time</span>
                            <span className={styles.summaryValue}>{formatMinutes(totalMinutes)}</span>
                            <span className={styles.summaryMeta}>total logged duration</span>
                        </div>

                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>This Week</span>
                            <span className={styles.summaryValue}>{formatMinutes(currentWeekMinutes)}</span>
                            <span className={styles.summaryMeta}>
                                {currentWeekWorkouts.length} workout{currentWeekWorkouts.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Previous Week</span>
                            <span className={styles.summaryValue}>{formatMinutes(previousWeekMinutes)}</span>
                            <span className={styles.summaryMeta}>
                                {previousWeekWorkouts.length} workout{previousWeekWorkouts.length === 1 ? "" : "s"}
                            </span>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionKicker}>Plan adherence</p>
                                <h2 className={styles.sectionTitle}>Planned vs Completed</h2>
                            </div>
                        </div>

                        <div className={styles.planStatsGrid}>
                            <div className={styles.planStatCard}>
                                <span className={styles.planStatLabel}>Completion Rate</span>
                                <span className={styles.planStatValue}>{completionRate}%</span>
                                <span className={styles.planStatMeta}>completed vs missed</span>
                            </div>

                            <div className={styles.planStatCard}>
                                <span className={styles.planStatLabel}>Completed</span>
                                <span className={styles.planStatValue}>{completedPlannedWorkouts.length}</span>
                                <span className={styles.planStatMeta}>planned workouts</span>
                            </div>

                            <div className={styles.planStatCard}>
                                <span className={styles.planStatLabel}>Missed</span>
                                <span className={styles.planStatValue}>{missedPlannedWorkouts.length}</span>
                                <span className={styles.planStatMeta}>past incomplete workouts</span>
                            </div>

                            <div className={styles.planStatCard}>
                                <span className={styles.planStatLabel}>Upcoming</span>
                                <span className={styles.planStatValue}>{upcomingPlannedWorkouts.length}</span>
                                <span className={styles.planStatMeta}>future planned workouts</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionKicker}>By discipline</p>
                                <h2 className={styles.sectionTitle}>Training Breakdown</h2>
                            </div>
                        </div>

                        <div className={styles.disciplineGrid}>
                            {disciplineTotals.map((total) => (
                                <div key={total.discipline} className={styles.disciplineCard}>
                                    <div className={styles.disciplineTop}>
                                        <span className={styles.disciplineIcon}>
                                            {disciplineCode(total.discipline)}
                                        </span>

                                        <div>
                                            <span className={styles.disciplineName}>{total.discipline}</span>
                                            <span className={styles.disciplineCount}>
                                                {total.count} session{total.count === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.disciplineStats}>
                                        <div>
                                            <span className={styles.statValue}>
                                                {roundDistance(total.distance)}
                                            </span>
                                            <span className={styles.statLabel}>
                                                {distanceUnit(total.discipline, profile?.metric ?? true)}
                                            </span>
                                        </div>

                                        <div>
                                            <span className={styles.statValue}>
                                                {formatMinutes(total.minutes)}
                                            </span>
                                            <span className={styles.statLabel}>time</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionKicker}>Last 6 weeks</p>
                                <h2 className={styles.sectionTitle}>Weekly Volume</h2>
                            </div>
                        </div>

                        <div className={styles.volumeList}>
                            {weeklySummaries.map((week) => {
                                const width = `${Math.max((week.totalMinutes / maxWeeklyMinutes) * 100, week.totalMinutes > 0 ? 8 : 0)}%`;

                                return (
                                    <div key={week.weekStart} className={styles.volumeRow}>
                                        <div className={styles.volumeMeta}>
                                            <span className={styles.volumeDate}>
                                                {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                                            </span>
                                            <span className={styles.volumeStats}>
                                                {formatMinutes(week.totalMinutes)} · {week.workoutCount} workout{week.workoutCount === 1 ? "" : "s"}
                                            </span>
                                        </div>

                                        <div className={styles.volumeTrack}>
                                            <div
                                                className={styles.volumeBar}
                                                style={{ width }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionKicker}>Recent history</p>
                                <h2 className={styles.sectionTitle}>Latest Workouts</h2>
                            </div>

                            <a href="/log" className={styles.sectionLink}>View Log</a>
                        </div>

                        <div className={styles.recentList}>
                            {sortedWorkouts.slice(0, 6).map((workout) => (
                                <div key={workout.id} className={styles.recentRow}>
                                    <span className={styles.recentIcon}>
                                        {disciplineCode(workout.workoutDiscipline)}
                                    </span>

                                    <div className={styles.recentInfo}>
                                        <div className={styles.recentTop}>
                                            <span className={styles.recentTitle}>
                                                {workout.workoutTitle || `${workout.workoutDiscipline} Session`}
                                            </span>
                                            <span className={styles.recentDate}>
                                                {formatDate(workout.workoutDate)}
                                            </span>
                                        </div>

                                        <span className={styles.recentMeta}>
                                            {workout.workoutType ? `${workout.workoutType} · ` : ""}
                                            {workout.workoutDurationMinutes} min · {workout.workoutDistance} {distanceUnit(workout.workoutDiscipline, profile?.metric ?? true)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </AppShell>
    );
}