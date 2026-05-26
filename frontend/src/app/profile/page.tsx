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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }
    }, [router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);


        const heightInCm = metric
            ? parseFloat(height)
            : (parseInt(feet) * 12 + parseInt(inches)) * 2.54;
            
        // Convert birthday from yyyy-MM-dd (HTML date input) to LocalDate-compatible ISO string
        const response = await AuthPostRequest<ProfileResponse>("/api/profile", {
            metric,
            height: heightInCm,
            weight: parseFloat(weight),
            birthday,
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
                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Feet</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    placeholder="5"
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
