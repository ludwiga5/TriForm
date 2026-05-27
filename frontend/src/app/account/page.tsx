"use client";

import styles from "./account.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest, PutRequest } from "@/lib/api-helper";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
}

interface ProfileResponse {
    message: string;
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", active: false },
    { label: "Training Plan", href: "/plan", active: false },
    { label: "Log Workout", href: "/log", active: false },
    { label: "Progress", href: "/progress", active: false },
    { label: "Account", href: "/account", active: true },
];

function formatImperialHeight(heightCm: number): { feet: string; inches: string } {
    const totalInches = Math.round(heightCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    return {
        feet: String(feet),
        inches: String(inches),
    };
}

export default function AccountPage() {
    const router = useRouter();

    const [metric, setMetric] = useState(true);
    const [height, setHeight] = useState("");
    const [feet, setFeet] = useState("");
    const [inches, setInches] = useState("");
    const [weight, setWeight] = useState("");
    const [birthday, setBirthday] = useState("");

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        AuthGetRequest<UserProfile>("/api/profile").then((res) => {
            if (res.error === "Profile not found") {
                router.push("/profile");
                return;
            }

            if (res.error) {
                localStorage.removeItem("token");
                router.push("/");
                return;
            }

            if (res.data) {
                setProfile(res.data);
                setMetric(res.data.metric);
                setWeight(String(res.data.weight));

                if (res.data.metric) {
                    setHeight(String(Math.round(res.data.height)));
                } else {
                    const imperialHeight = formatImperialHeight(res.data.height);
                    setFeet(imperialHeight.feet);
                    setInches(imperialHeight.inches);
                }
            }

            setLoading(false);
        });
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setErrorMessage(null);
        setSuccessMessage(null);

        const heightInCm = metric ? parseFloat(height) : (parseInt(feet) * 12 + parseInt(inches)) * 2.54;
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
            setErrorMessage("Enter your date of birth so your age can be recalculated.");
            return;
        }

        setSaving(true);

        const response = await PutRequest<ProfileResponse>("/api/profile", {
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

        setSuccessMessage("Profile updated.");

        const updatedProfile = await AuthGetRequest<UserProfile>("/api/profile");

        if (updatedProfile.data) {
            setProfile(updatedProfile.data);
            setBirthday("");
        }
    }

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
                    <p className={styles.headerSub}>Manage profile</p>
                    <h1 className={styles.headerTitle}>Account</h1>
                </header>

                <div className={styles.content}>
                    <section className={styles.summaryCard}>
                        <p className={styles.cardKicker}>Current Profile</p>

                        <div className={styles.profileStat}>
                            <span className={styles.statLabel}>Age</span>
                            <span className={styles.statValue}>{profile?.age} years</span>
                        </div>

                        <div className={styles.profileStat}>
                            <span className={styles.statLabel}>Units</span>
                            <span className={styles.statValue}>{profile?.metric ? "Metric" : "Imperial"}</span>
                        </div>

                        <div className={styles.profileStat}>
                            <span className={styles.statLabel}>Height</span>
                            <span className={styles.statValue}>
                                {profile?.metric ? `${Math.round(profile.height)} cm` : `${formatImperialHeight(profile?.height ?? 0).feet}'${formatImperialHeight(profile?.height ?? 0).inches}"`}
                            </span>
                        </div>

                        <div className={styles.profileStat}>
                            <span className={styles.statLabel}>Weight</span>
                            <span className={styles.statValue}>
                                {profile?.weight} {profile?.metric ? "kg" : "lbs"}
                            </span>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <h2>Edit Profile</h2>

                            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                            {successMessage && <div className={styles.success}>{successMessage}</div>}

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
                                        min={1}
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
                                            min={1}
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
                                            min={0}
                                            max={11}
                                            placeholder="10"
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
                                    min={1}
                                    step={0.1}
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
                                <p className={styles.helpText}>Required when saving because the backend recalculates age from this date.</p>
                            </div>

                            <button className={styles.primaryButton} type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}