"use client";

import styles from "./log.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, AuthPostRequest, PutRequest, DeleteRequest } from "@/lib/api-helper";

type WorkoutType = "EASY" | "RECOVERY" | "TEMPO" | "INTERVALS" | "LONG" | "RACE";

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

interface UserProfile {
    metric: boolean;
}

const DISCIPLINES = ["Swim", "Bike", "Run"];

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
    { value: "EASY", label: "Easy" },
    { value: "RECOVERY", label: "Recovery" },
    { value: "TEMPO", label: "Tempo" },
    { value: "INTERVALS", label: "Intervals" },
    { value: "LONG", label: "Long" },
    { value: "RACE", label: "Race" },
];

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", active: false },
    { label: "Training Plan", href: "/plan", active: false },
    { label: "Log Workout", href: "/log", active: true },
    { label: "Progress", href: "/progress", active: false },
    { label: "Account", href: "/account", active: false },
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

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

function formatWorkoutType(type: WorkoutType | null): string {
    if (!type) return "Unspecified";

    return type
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
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
    const [listLoading, setListLoading] = useState(true);
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
            if (profileRes.error === "Profile not found") {
                router.push("/profile");
                return;
            }

            if (profileRes.error || workoutsRes.error) {
                localStorage.removeItem("token");
                router.push("/");
                return;
            }

            if (profileRes.data) {
                setMetric(profileRes.data.metric);
            }

            const sorted = (workoutsRes.data ?? []).sort((a, b) => {
                return new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime();
            });

            setWorkouts(sorted);
            setListLoading(false);
        });
    }, [router]);

    async function fetchWorkouts() {
        const res = await AuthGetRequest<Workout[]>("/api/workout");

        if (res.data) {
            const sorted = res.data.sort((a, b) => {
                return new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime();
            });

            setWorkouts(sorted);
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
        setFormError(null);
    }

    function startEditing(workout: Workout) {
        setEditingId(workout.id);
        setTitle(workout.workoutTitle || "");
        setDiscipline(workout.workoutDiscipline);
        setType(workout.workoutType ?? "EASY");
        setDate(workout.workoutDate);
        setDurationMin(String(workout.workoutDurationMinutes));
        setDistance(String(workout.workoutDistance));
        setNotes(workout.workoutNotes ?? "");
        setFormError(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        const trimmedTitle = title.trim();
        const parsedDuration = parseInt(durationMin);
        const parsedDistance = parseFloat(distance);

        if (!trimmedTitle) {
            setFormError("Enter a workout title.");
            return;
        }

        if (!parsedDuration || parsedDuration <= 0) {
            setFormError("Enter a valid duration.");
            return;
        }

        if (!parsedDistance || parsedDistance <= 0) {
            setFormError("Enter a valid distance.");
            return;
        }

        const workoutBody = {
            title: trimmedTitle,
            discipline,
            type,
            date,
            durationMin: parsedDuration,
            distance: parsedDistance,
            notes: notes.trim(),
        };

        setSubmitting(true);

        const res = editingId
            ? await PutRequest(`/api/workout/${editingId}`, workoutBody)
            : await AuthPostRequest("/api/workout", workoutBody);

        setSubmitting(false);

        if (res.error) {
            setFormError(res.error);
            return;
        }

        resetForm();
        fetchWorkouts();
    }

    async function handleDelete(id: number) {
        setDeletingId(id);

        const res = await DeleteRequest(`/api/workout/${id}`);

        if (res.error) {
            await fetchWorkouts();
        } else {
            setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
        }

        if (editingId === id) {
            resetForm();
        }

        setDeletingId(null);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/");
    }

    const unit = distanceUnit(discipline, metric);

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
                    <p className={styles.headerSub}>Track your training</p>
                    <h1 className={styles.headerTitle}>{editingId ? "Edit Workout" : "Log Workout"}</h1>
                </header>

                <div className={styles.content}>
                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>{editingId ? "Update Session" : "New Session"}</h2>

                        <div className={styles.card}>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                {formError && <div className={styles.error}>{formError}</div>}

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Title</label>
                                    <input
                                        className={styles.inputField}
                                        type="text"
                                        placeholder="Morning Tempo Run"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Discipline</label>

                                    <div className={styles.disciplineToggle}>
                                        {DISCIPLINES.map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                className={`${styles.disciplineOption} ${discipline === d ? styles.disciplineActive : ""}`}
                                                onClick={() => setDiscipline(d)}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Workout Type</label>

                                    <select className={styles.inputField} value={type} onChange={(e) => setType(e.target.value as WorkoutType)} required>
                                        {WORKOUT_TYPES.map((workoutType) => (
                                            <option key={workoutType.value} value={workoutType.value}>
                                                {workoutType.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Date</label>
                                    <input className={styles.inputField} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Duration (min)</label>
                                        <input
                                            className={styles.inputField}
                                            type="number"
                                            min={1}
                                            placeholder="45"
                                            value={durationMin}
                                            onChange={(e) => setDurationMin(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Distance ({unit})</label>
                                        <input
                                            className={styles.inputField}
                                            type="number"
                                            min={0.1}
                                            step={0.1}
                                            placeholder={discipline === "Swim" ? "400" : "10"}
                                            value={distance}
                                            onChange={(e) => setDistance(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Notes (optional)</label>
                                    <textarea
                                        className={styles.textArea}
                                        placeholder="How did it feel?"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <button className={styles.primaryButton} type="submit" disabled={submitting}>
                                    {submitting ? "Saving..." : editingId ? "Update Session" : "Log Session"}
                                </button>

                                {editingId && (
                                    <button className={styles.secondaryButton} type="button" onClick={resetForm} disabled={submitting}>
                                        Cancel Edit
                                    </button>
                                )}
                            </form>
                        </div>
                    </section>

                    <section className={styles.listSection}>
                        <h2 className={styles.sectionTitle}>Past Sessions</h2>

                        {listLoading ? (
                            <div className={styles.loadingRow}>
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                            </div>
                        ) : workouts.length === 0 ? (
                            <div className={styles.empty}>No sessions logged yet. Add your first one.</div>
                        ) : (
                            <div className={styles.workoutList}>
                                {workouts.map((workout) => {
                                    const meta = DISCIPLINE_META[workout.workoutDiscipline] ?? { short: "TR", color: "#555" };
                                    const workoutUnit = distanceUnit(workout.workoutDiscipline, metric);
                                    const isEditing = editingId === workout.id;

                                    return (
                                        <div key={workout.id} className={`${styles.workoutRow} ${isEditing ? styles.workoutRowActive : ""}`}>
                                            <span className={styles.workoutIcon} style={{ background: meta.color + "22", color: meta.color }}>
                                                {meta.short}
                                            </span>

                                            <div className={styles.workoutInfo}>
                                                <div className={styles.workoutHeader}>
                                                    <span className={styles.workoutDiscipline}>{workout.workoutTitle || workout.workoutDiscipline}</span>
                                                    <span className={styles.workoutDate}>{workout.workoutDate}</span>
                                                </div>

                                                <div className={styles.workoutStats}>
                                                    <span className={styles.workoutStat}>
                                                        <span className={styles.statLabel}>Type</span>
                                                        <span className={styles.statValue}>{formatWorkoutType(workout.workoutType)}</span>
                                                    </span>

                                                    <span className={styles.statDivider}>·</span>

                                                    <span className={styles.workoutStat}>
                                                        <span className={styles.statLabel}>Sport</span>
                                                        <span className={styles.statValue}>{workout.workoutDiscipline}</span>
                                                    </span>

                                                    <span className={styles.statDivider}>·</span>

                                                    <span className={styles.workoutStat}>
                                                        <span className={styles.statLabel}>Time</span>
                                                        <span className={styles.statValue}>{workout.workoutDurationMinutes} min</span>
                                                    </span>

                                                    <span className={styles.statDivider}>·</span>

                                                    <span className={styles.workoutStat}>
                                                        <span className={styles.statLabel}>Distance</span>
                                                        <span className={styles.statValue}>{workout.workoutDistance} {workoutUnit}</span>
                                                    </span>
                                                </div>

                                                {workout.workoutNotes && <span className={styles.workoutNotes}>{workout.workoutNotes}</span>}
                                            </div>

                                            <div className={styles.rowActions}>
                                                <button className={styles.editButton} onClick={() => startEditing(workout)} disabled={submitting || deletingId === workout.id}>
                                                    Edit
                                                </button>

                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(workout.id)}
                                                    disabled={deletingId === workout.id}
                                                    aria-label="Delete workout"
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
            </main>
        </div>
    );
}