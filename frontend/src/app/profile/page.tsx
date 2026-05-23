"use client";

import styles from "./profile.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPostRequest } from "@/lib/api-helper";

interface ProfileResponse {
    message: string;
}

export default function ProfileSetupPage() {
    const router = useRouter();
    const [metric, setMetric] = useState(true);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [birthday, setBirthday] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        // Convert birthday from yyyy-MM-dd (HTML date input) to LocalDate-compatible ISO string
        const response = await AuthPostRequest<ProfileResponse>("/api/profile", {
            metric,
            height: parseFloat(height),
            weight: parseFloat(weight),
            birthday,  // ISO format: "yyyy-MM-dd" — matches LocalDate deserialization in Spring
        });

        setLoading(false);

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

        if (response.data) {
            router.push("/dashboard");
        }
    };

    return (
        <div className={styles.page}>
            <main className={styles.intro}>
                <h1>Set Up Profile</h1>
                <p className={styles.subtitle}>Tell us about yourself so we can build your training plan</p>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.profileForm}>
                        <h2>Your Stats</h2>

                        {errorMessage && (
                            <div className={styles.error}>{errorMessage}</div>
                        )}

                        {/* Unit toggle */}
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

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                Height ({metric ? "cm" : "inches"})
                            </label>
                            <input
                                className={styles.inputField}
                                type="number"
                                placeholder={metric ? "e.g. 178" : "e.g. 70"}
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                Weight ({metric ? "kg" : "lbs"})
                            </label>
                            <input
                                className={styles.inputField}
                                type="number"
                                placeholder={metric ? "e.g. 72" : "e.g. 158"}
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

                        <button
                            className={styles.primaryButton}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Continue"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
