"use client";

import styles from "./account.module.css";
import AppShell from "@/components/AppShell";
import shellStyles from "@/components/AppShell.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, PutRequest } from "@/lib/api-helper";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
    birthday?: string;
}

export default function AccountPage() {
    const router = useRouter();

    const [metric, setMetric] = useState(true);
    const [height, setHeight] = useState("");
    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");
    const [weight, setWeight] = useState("");
    const [birthday, setBirthday] = useState("");

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
                setHeight(String(profile.height));
                setWeight(String(profile.weight));

                if (profile.birthday) {
                    setBirthday(profile.birthday);
                }
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

        setSaving(true);

        const response = await PutRequest<{ message: string }>("/api/profile", {
            metric,
            height: heightInCm,
            weight: weightValue,
            birthday,
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

                        <button className={styles.primaryButton} type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>
            </section>
        </AppShell>
    );
}