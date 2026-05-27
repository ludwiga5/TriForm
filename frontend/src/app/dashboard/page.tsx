"use client";

import styles from "./dashboard.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGetRequest } from "@/lib/api-helper";

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Training Plan", href: "/plan", active: false },
    { label: "Log Workout", href: "/log", active: true },
    { label: "Progress", href: "/progress", active: false },
    { label: "Account", href: "/account", active: false },
];

const DISCIPLINES = [
    { key: "swim", label: "Swim", icon: "🏊", color: "#1a6fa3" },
    { key: "bike", label: "Bike", icon: "🚴", color: "#922" },
    { key: "run",  label: "Run",  icon: "🏃", color: "#2a7a4b" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        AuthGetRequest<UserProfile>("/api/profile").then((res) => {
            if (res.error) {
                // Token invalid or expired
                localStorage.removeItem("token");
                router.push("/");
            } else {
                setProfile(res.data ?? null);
            }
            setLoading(false);
        });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

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

            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <span className={styles.logoMark}>TF</span>
                    <span className={styles.logoText}>TriForm</span>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            {/* Main content */}
            <main className={styles.main}>

                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <p className={styles.headerSub}>Welcome back</p>
                        <h1 className={styles.headerTitle}>Dashboard</h1>
                    </div>
                    {profile && (
                        <div className={styles.profileBadge}>
                            <span className={styles.profileBadgeAge}>{profile.age} yrs</span>
                            <span className={styles.profileBadgeStat}>
                                {profile.weight} {profile.metric ? "kg" : "lbs"} · {formatHeight(profile.height, profile.metric)}
                            </span>
                        </div>
                    )}
                </header>

                {/* Discipline cards */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Disciplines</h2>
                    <div className={styles.disciplineGrid}>
                        {DISCIPLINES.map((d) => (
                            <div key={d.key} className={styles.disciplineCard}>
                                <span className={styles.disciplineIcon}>{d.icon}</span>
                                <span className={styles.disciplineLabel}>{d.label}</span>
                                <span className={styles.disciplineComingSoon}>Coming soon</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feature panels */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your Training</h2>
                    <div className={styles.panelGrid}>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>Training Plan</span>
                                <span className={styles.panelBadge}>Soon</span>
                            </div>
                            <p className={styles.panelBody}>
                                Generate a personalized week-by-week triathlon plan based on your goal race and current fitness.
                            </p>
                            <button className={styles.panelButton} disabled>
                                Generate Plan
                            </button>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>Log Workout</span>
                                <span className={styles.panelBadge}>Soon</span>
                            </div>
                            <p className={styles.panelBody}>
                                Record your swim, bike, and run sessions with distance, duration, and perceived effort.
                            </p>
                            <button className={styles.panelButton}>
                                <a href="/log" className={styles.panelButton}>Log Session</a>
                            </button>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>Progress</span>
                                <span className={styles.panelBadge}>Soon</span>
                            </div>
                            <p className={styles.panelBody}>
                                Track volume trends across disciplines and see how your training load builds over time.
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

function formatHeight(heightCm: number, metric: boolean): string {
    if (metric) return `${heightCm} cm`;
    const totalInches = Math.round(heightCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
}