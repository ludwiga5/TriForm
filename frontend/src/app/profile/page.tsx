"use client";

import styles from "./profile.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPostRequest } from "@/lib/api-helper";

interface ProfileResponse {
    message: string;
}

export default function ProfileSetupPage() {
    const router = useRouter();

    const [metric, setMetric] = useState(true);
    const [height, setHeight] = useState("");
    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");
    const [weight, setWeight] = useState("");
    const [birthday, setBirthday] = useState("");
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);

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

        setLoading(true);

        const response = await AuthPostRequest<ProfileResponse>("/api/profile", {
            metric,
            height: heightInCm,
            weight: weightValue,
            birthday,
        });

        setLoading(false);

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

        router.push("/dashboard");
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
                            <span className={styles.toggleLabel}>Units</span>

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
                                    placeholder="178"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className={styles.heightGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Feet</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        placeholder="5"
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
                                        placeholder="10"
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
                                placeholder={metric ? "72" : "158"}
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

                        <button className={styles.primaryButton} type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Continue"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}