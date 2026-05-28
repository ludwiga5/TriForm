"use client";

import styles from "./log.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, AuthPostRequest, DeleteRequest, PutRequest } from "@/lib/api-helper";

type WorkoutType = "EASY" | "TEMPO" | "INTERVALS" | "LONG" | "RECOVERY" | "RACE";

interface Workout {
    id: number;
    workoutTitle: string;
    workoutDiscipline: string;
    workoutDate: string;
    workoutDurationMinutes: number;
    workoutDistance: number;
    workoutNotes: string;
    workoutType: WorkoutType;
}

interface UserProfile {
    metric: boolean;
}

const DISCIPLINES = ["Swim", "Bike", "Run"];
const WORKOUT_TYPES: WorkoutType[] = ["EASY", "TEMPO", "INTERVALS", "LONG", "RECOVERY", "RACE"];

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

function disciplineCode(discipline: string): string {
    if (discipline === "Swim") return "SW";
    if (discipline === "Bike") return "BK";
    return "RN";
}

function distanceUnit(discipline: string, metric: boolean): string {
    if (discipline === "Swim") return metric ? "m" : "yd";
    return metric ? "km" : "mi";
}

export default function LogPage() {
    const router = useRouter();

    const [metric, setMetric] = useState(true);
    const [title, setTitle] = useState("");
    const [discipline, setDiscipline] = useState("Run");
    const [type, setType] = useState<WorkoutType>("EASY");
    const [date, setDate] = useState(todayISO());
    const [durationMin, setDurationMin] = useState("");
    const [distance, setDistance] = useState("");
    const [notes, setNotes] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

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
                if (profileRes.error === "Profile not found") {
                    router.push("/profile");
                } else {
                    localStorage.removeItem("token");
                    router.push("/");
                }

                return;
            }

            if (profileRes.data) {
                setMetric(profileRes.data.metric);
            }

            if (workoutsRes.data) {
                setWorkouts(sortWorkouts(workoutsRes.data));
            }

            setPageLoading(false);
        });
    }, [router]);

    function sortWorkouts(data: Workout[]) {
        return data.sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime());
    }

    async function fetchWorkouts() {
        const response = await AuthGetRequest<Workout[]>("/api/workout");

        if (response.data) {
            setWorkouts(sortWorkouts(response.data));
        }
    }

    function resetForm() {
        setTitle("");
        setDiscipline("Run");
        setType("EASY");
        setDate(todayISO());
        setDurationMin("");
        setDistance("");
        setNotes("");
        setEditingId(null);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setFormError(null);

        if (!title.trim()) {
            setFormError("Enter a workout title.");
            return;
        }

        if (!durationMin || parseInt(durationMin) <= 0) {
            setFormError("Enter a valid duration.");
            return;
        }

        if (!distance || parseFloat(distance) <= 0) {
            setFormError("Enter a valid distance.");
            return;
        }

        const payload = {
            title: title.trim(),
            discipline,
            type,
            date,
            durationMin: parseInt(durationMin),
            distance: parseFloat(distance),
            notes,
        };

        setSubmitting(true);

        const response = editingId
            ? await PutRequest(`/api/workout/${editingId}`, payload)
            : await AuthPostRequest("/api/workout", payload);

        setSubmitting(false);

        if (response.error) {
            setFormError(response.error);
            return;
        }

        resetForm();
        fetchWorkouts();
    }

    function handleEdit(workout: Workout) {
        setEditingId(workout.id);
        setTitle(workout.workoutTitle || `${workout.workoutDiscipline} Session`);
        setDiscipline(workout.workoutDiscipline);
        setType(workout.workoutType || "EASY");
        setDate(workout.workoutDate);
        setDurationMin(String(workout.workoutDurationMinutes));
        setDistance(String(workout.workoutDistance));
        setNotes(workout.workoutNotes || "");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(id: number) {
        setDeletingId(id);

        const response = await DeleteRequest(`/api/workout/${id}`);

        if (response.error) {
            await fetchWorkouts();
        } else {
            setWorkouts((current) => current.filter((workout) => workout.id !== id));
        }

        setDeletingId(null);
    }

    const unit = distanceUnit(discipline, metric);

    if (pageLoading) {
        return (
            <div className={shellStyles.loadingScreen}>
                <div className={shellStyles.loadingDot} />
                <div className={shellStyles.loadingDot} />
                <div className={shellStyles.loadingDot} />
            </div>
        );
    }

    return (
        <AppShell activePage="Log Workout">
            <header className={styles.header}>
                <p className={styles.headerSub}>Track your training</p>
                <h1 className={styles.headerTitle}>Log Workout</h1>
            </header>

            <div className={styles.content}>
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>{editingId ? "Edit Session" : "New Session"}</h2>

                    <div className={styles.card}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {formError && <div className={styles.error}>{formError}</div>}

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Title</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Easy Run"
                                    required
                                />
                            </div>

                            <div className={styles.twoColumn}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Discipline</label>
                                    <select
                                        className={styles.inputField}
                                        value={discipline}
                                        onChange={(e) => setDiscipline(e.target.value)}
                                    >
                                        {DISCIPLINES.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Type</label>
                                    <select
                                        className={styles.inputField}
                                        value={type}
                                        onChange={(e) => setType(e.target.value as WorkoutType)}
                                    >
                                        {WORKOUT_TYPES.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Date</label>
                                <input
                                    className={styles.inputField}
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.twoColumn}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Duration</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(e.target.value)}
                                        placeholder="45"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Distance ({unit})</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        step="0.01"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="5.25"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Notes</label>
                                <textarea
                                    className={styles.textArea}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className={styles.buttonRow}>
                                <button className={styles.primaryButton} type="submit" disabled={submitting}>
                                    {submitting ? "Saving..." : editingId ? "Save Changes" : "Log Session"}
                                </button>

                                {editingId && (
                                    <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>

                <section className={styles.listSection}>
                    <h2 className={styles.sectionTitle}>Past Sessions</h2>

                    {workouts.length === 0 ? (
                        <div className={styles.empty}>No sessions logged yet. Add your first one.</div>
                    ) : (
                        <div className={styles.workoutList}>
                            {workouts.map((workout) => {
                                const workoutUnit = distanceUnit(workout.workoutDiscipline, metric);

                                return (
                                    <div key={workout.id} className={styles.workoutRow}>
                                        <span className={styles.workoutIcon}>
                                            {disciplineCode(workout.workoutDiscipline)}
                                        </span>

                                        <div className={styles.workoutInfo}>
                                            <div className={styles.workoutHeader}>
                                                <span className={styles.workoutDiscipline}>
                                                    {workout.workoutTitle || workout.workoutDiscipline}
                                                </span>
                                                <span className={styles.workoutDate}>{workout.workoutDate}</span>
                                            </div>

                                            <div className={styles.workoutStats}>
                                                <span>{workout.workoutType}</span>
                                                <span>{workout.workoutDurationMinutes} min</span>
                                                <span>{workout.workoutDistance} {workoutUnit}</span>
                                            </div>

                                            {workout.workoutNotes && (
                                                <span className={styles.workoutNotes}>{workout.workoutNotes}</span>
                                            )}
                                        </div>

                                        <div className={styles.rowActions}>
                                            <button className={styles.textButton} onClick={() => handleEdit(workout)}>
                                                Edit
                                            </button>

                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDelete(workout.id)}
                                                disabled={deletingId === workout.id}
                                            >
                                                {deletingId === workout.id ? "..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}