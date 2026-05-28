"use client";

import styles from "./AppShell.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ActivePage = "Dashboard" | "Training Plan" | "Log Workout" | "Progress" | "Account";

interface AppShellProps {
    activePage: ActivePage;
    children: React.ReactNode;
}

const NAV_ITEMS: { label: ActivePage; href: string; icon: string }[] = [
    { label: "Dashboard", href: "/dashboard", icon: "DA" },
    { label: "Training Plan", href: "/plan", icon: "TP" },
    { label: "Log Workout", href: "/log", icon: "LW" },
    { label: "Progress", href: "/progress", icon: "PR" },
    { label: "Account", href: "/account", icon: "AC" },
];

export default function AppShell({ activePage, children }: AppShellProps) {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/");
    }

    return (
        <div className={styles.page}>
            <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
                <div className={styles.sidebarLogo}>
                    <span className={styles.logoMark}>TF</span>
                    {!sidebarCollapsed && <span className={styles.logoText}>TriForm</span>}
                </div>

                <button
                    className={styles.collapseButton}
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    type="button"
                    title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {sidebarCollapsed ? ">" : "<"}
                </button>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            title={item.label}
                            className={`${styles.navItem} ${activePage === item.label ? styles.navItemActive : ""}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </a>
                    ))}
                </nav>

                <button className={styles.logoutButton} onClick={handleLogout} title="Logout">
                    {sidebarCollapsed ? "OUT" : "Logout"}
                </button>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}