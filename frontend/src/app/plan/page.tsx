"use client";

import styles from "./plan.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, AuthPostRequest, DeleteRequest, PutRequest } from "@/lib/api-helper";

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

interface LogPlannedWorkoutRequest {
    durationMin: number;
    distance: number;
    notes: string;
}

interface WorkoutResponse {
    id: number;
    workoutTitle?: string;
    workoutDiscipline: string;
    workoutDate: string;
    workoutDurationMinutes: number;
    workoutDistance: number;
    workoutNotes: string;
    workoutType?: string;
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

const RACE_TYPES: { label: string; value: RaceType; weeks: number }[] = [
    { label: "Sprint", value: "SPRINT", weeks: 10 },
    { label: "Olympic", value: "OLYMPIC", weeks: 14 },
    { label: "Half Ironman", value: "HALF_IRONMAN", weeks: 20 },
    { label: "Full Ironman", value: "FULL_IRONMAN", weeks: 32 },
];

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

function formatDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatWorkoutDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function daysUntil(date: string): number {
    const today = new Date(todayISO());
    const raceDay = new Date(`${date}T00:00:00`);
    const diff = raceDay.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function disciplineCode(discipline: string): string {
    if (discipline === "Swim") return "SW";
    if (discipline === "Bike") return "BK";
    if (discipline === "Run") return "RN";
    return discipline.slice(0, 2).toUpperCase();
}

function distanceUnit(discipline: string): string {
    if (discipline === "Swim") return "m";
    return "mi";
}

export default function PlanPage() {
    const router = useRouter();

    const [plans, setPlans] = useState<TrainingPlanResponse[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlanDetailResponse | null>(null);

    const [raceName, setRaceName] = useState("");
    const [raceType, setRaceType] = useState<RaceType>("SPRINT");
    const [raceDay, setRaceDay] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedRaceType = RACE_TYPES.find((type) => type.value === raceType);

    const groupedWorkouts = useMemo(() => {
        const groups: Record<number, PlannedWorkoutResponse[]> = {};

        if (!selectedPlan) return groups;

        selectedPlan.workouts.forEach((workout) => {
            if (!groups[workout.weekNumber]) {
                groups[workout.weekNumber] = [];
            }

            groups[workout.weekNumber].push(workout);
        });

        return groups;
    }, [selectedPlan]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        loadPlans();
    }, [router]);

    async function loadPlans() {
        setLoading(true);
        setError(null);

        const response = await AuthGetRequest<TrainingPlanResponse[]>("/api/plans");

        if (response.error) {
            handleAuthError(response.error);
            setLoading(false);
            return;
        }

        const sortedPlans = (response.data ?? []).sort((a, b) => {
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        });

        setPlans(sortedPlans);

        if (sortedPlans.length > 0) {
            await loadPlanDetails(sortedPlans[0].id);
        }

        setLoading(false);
    }

    async function loadPlanDetails(id: number) {
        setDetailsLoading(true);
        setError(null);

        const response = await AuthGetRequest<TrainingPlanDetailResponse>(`/api/plans/${id}`);

        if (response.error) {
            handleAuthError(response.error);
            setDetailsLoading(false);
            return;
        }

        setSelectedPlan(response.data ?? null);
        setDetailsLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!raceName.trim()) {
            setError("Race name is required.");
            return;
        }

        if (!raceDay) {
            setError("Race day is required.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const response = await AuthPostRequest<TrainingPlanDetailResponse>("/api/plans/generate", {
            raceName: raceName.trim(),
            raceType,
            raceDay,
            location: location.trim(),
        });

        if (response.error) {
            handleAuthError(response.error);
            setSubmitting(false);
            return;
        }

        if (response.data) {
            setSelectedPlan(response.data);
            setPlans((currentPlans) => [response.data as TrainingPlanResponse, ...currentPlans]);
        }

        setRaceName("");
        setRaceType("SPRINT");
        setRaceDay("");
        setLocation("");
        setSubmitting(false);
    }

    async function handleDeletePlan(id: number) {
        const shouldDelete = window.confirm("Delete this training plan? This cannot be undone.");

        if (!shouldDelete) return;

        setDeletingId(id);
        setError(null);

        const response = await DeleteRequest<{ message: string }>(`/api/plans/${id}`);

        if (response.error) {
            handleAuthError(response.error);
            setDeletingId(null);
            return;
        }

        const updatedPlans = plans.filter((plan) => plan.id !== id);
        setPlans(updatedPlans);

        if (selectedPlan?.id === id) {
            setSelectedPlan(null);

            if (updatedPlans.length > 0) {
                await loadPlanDetails(updatedPlans[0].id);
            }
        }

        setDeletingId(null);
    }

    async function handleToggleWorkoutComplete(workout: PlannedWorkoutResponse) {
        setError(null);

        if (workout.completed) {
            const response = await PutRequest<PlannedWorkoutResponse>(
                `/api/plans/workouts/${workout.id}/toggle-complete`,
                {}
            );

            if (response.error) {
                handleAuthError(response.error);
                return;
            }

            if (!response.data || !selectedPlan) {
                return;
            }

            const updatedWorkout = response.data;

            setSelectedPlan({
                ...selectedPlan,
                workouts: selectedPlan.workouts.map((item) =>
                    item.id === updatedWorkout.id ? updatedWorkout : item
                ),
            });

            return;
        }

        const response = await AuthPostRequest<WorkoutResponse>(
            `/api/plans/workouts/${workout.id}/log`,
            {
                durationMin: workout.targetDurationMin,
                distance: workout.targetDistance,
                notes: workout.notes,
            } satisfies LogPlannedWorkoutRequest
        );

        if (response.error) {
            handleAuthError(response.error);
            return;
        }

        if (!selectedPlan) {
            return;
        }

        setSelectedPlan({
            ...selectedPlan,
            workouts: selectedPlan.workouts.map((item) =>
                item.id === workout.id ? { ...item, completed: true } : item
            ),
        });
    }

    function handleAuthError(message: string) {
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
            localStorage.removeItem("token");
            router.push("/");
            return;
        }

        setError(message);
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
        <AppShell activePage="Training Plan">
            <header className={styles.header}>
                <div>
                    <p className={styles.headerSub}>Build your race schedule</p>
                    <h1 className={styles.headerTitle}>Training Plan</h1>
                </div>

                {selectedPlan && (
                    <div className={styles.raceBadge}>
                        <span className={styles.raceBadgeLabel}>{selectedPlan.raceType.replace("_", " ")}</span>
                        <span className={styles.raceBadgeValue}>{daysUntil(selectedPlan.raceDay)} days</span>
                    </div>
                )}
            </header>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <div className={styles.content}>
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Generate Plan</h2>

                    <div className={styles.card}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Race Name</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Lake Placid Triathlon"
                                    value={raceName}
                                    onChange={(e) => setRaceName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Race Type</label>
                                <select
                                    className={styles.inputField}
                                    value={raceType}
                                    onChange={(e) => setRaceType(e.target.value as RaceType)}
                                >
                                    {RACE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Race Day</label>
                                <input
                                    className={styles.inputField}
                                    type="date"
                                    min={todayISO()}
                                    value={raceDay}
                                    onChange={(e) => setRaceDay(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Location</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Syracuse, NY"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className={styles.planHint}>
                                {selectedRaceType && (
                                    <span>
                                        This will generate a {selectedRaceType.weeks}-week plan.
                                    </span>
                                )}
                            </div>

                            <button className={styles.submitButton} type="submit" disabled={submitting}>
                                {submitting ? "Generating..." : "Generate Plan"}
                            </button>
                        </form>
                    </div>

                    <h2 className={styles.sectionTitle}>Saved Plans</h2>

                    <div className={styles.planList}>
                        {plans.length === 0 && (
                            <div className={styles.emptyState}>
                                No saved plans yet. Generate your first plan above.
                            </div>
                        )}

                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                className={`${styles.planListItem} ${selectedPlan?.id === plan.id ? styles.planListItemActive : ""}`}
                                onClick={() => loadPlanDetails(plan.id)}
                                type="button"
                            >
                                <span className={styles.planListTitle}>{plan.raceName}</span>
                                <span className={styles.planListMeta}>
                                    {plan.raceType.replace("_", " ")} · {formatDate(plan.raceDay)}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.detailSection}>
                    {!selectedPlan && (
                        <div className={styles.emptyDetail}>
                            <h2>No plan selected</h2>
                            <p>Generate a new training plan or choose one from your saved plans.</p>
                        </div>
                    )}

                    {selectedPlan && (
                        <>
                            <div className={styles.planHeaderCard}>
                                <div>
                                    <p className={styles.headerSub}>Current plan</p>
                                    <h2 className={styles.planTitle}>{selectedPlan.raceName}</h2>
                                    <p className={styles.planMeta}>
                                        {selectedPlan.location || "No location"} · Race day {formatDate(selectedPlan.raceDay)}
                                    </p>
                                </div>

                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeletePlan(selectedPlan.id)}
                                    disabled={deletingId === selectedPlan.id}
                                >
                                    {deletingId === selectedPlan.id ? "Deleting..." : "Delete Plan"}
                                </button>
                            </div>

                            <div className={styles.statGrid}>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Race Type</span>
                                    <span className={styles.statValue}>{selectedPlan.raceType.replace("_", " ")}</span>
                                </div>

                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Workouts</span>
                                    <span className={styles.statValue}>{selectedPlan.totalWorkouts}</span>
                                </div>

                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Start Date</span>
                                    <span className={styles.statValue}>{formatDate(selectedPlan.startDate)}</span>
                                </div>

                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Race Countdown</span>
                                    <span className={styles.statValue}>{daysUntil(selectedPlan.raceDay)} days</span>
                                </div>
                            </div>

                            {detailsLoading ? (
                                <div className={styles.emptyDetail}>
                                    <h2>Loading plan...</h2>
                                    <p>Fetching workouts.</p>
                                </div>
                            ) : (
                                <div className={styles.weekList}>
                                    {Object.entries(groupedWorkouts).map(([weekNumber, workouts]) => (
                                        <div key={weekNumber} className={styles.weekCard}>
                                            <div className={styles.weekHeader}>
                                                <h3>Week {weekNumber}</h3>
                                                <span>{workouts.length} sessions</span>
                                            </div>

                                            <div className={styles.workoutGrid}>
                                                {workouts.map((workout) => {
                                                    const status = getPlannedWorkoutStatus(workout);

                                                    return (
                                                        <div
                                                            key={workout.id}
                                                            className={`${styles.workoutCard} ${
                                                                status === "completed" ? styles.workoutCardCompleted : ""
                                                            } ${
                                                                status === "missed" ? styles.workoutCardMissed : ""
                                                            }`}
                                                        >
                                                            <div className={styles.workoutTop}>
                                                                <span className={styles.disciplineCode}>
                                                                    {disciplineCode(workout.discipline)}
                                                                </span>

                                                                <span className={styles.workoutDate}>
                                                                    {formatWorkoutDate(workout.scheduledDate)}
                                                                </span>
                                                            </div>

                                                            <div className={styles.workoutTitleRow}>
                                                                <h4 className={styles.workoutTitle}>{workout.title}</h4>

                                                                <span className={`${styles.statusBadge} ${styles[status]}`}>
                                                                    {formatPlannedWorkoutStatus(status)}
                                                                </span>
                                                            </div>

                                                            <div className={styles.workoutStats}>
                                                                <span>{workout.type}</span>
                                                                <span>{workout.targetDurationMin} min</span>
                                                                <span>
                                                                    {workout.targetDistance} {distanceUnit(workout.discipline)}
                                                                </span>
                                                            </div>

                                                            <p className={styles.workoutNotes}>{workout.notes}</p>

                                                            <button
                                                                className={workout.completed ? styles.completedButton : styles.completeButton}
                                                                onClick={() => handleToggleWorkoutComplete(workout)}
                                                                type="button"
                                                            >
                                                                {workout.completed ? "Undo Complete" : "Mark Complete"}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </AppShell>
    );
}