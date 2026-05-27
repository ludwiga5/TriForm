"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { PostRequest, AuthGetRequest } from "@/lib/api-helper";
import { useRouter } from "next/navigation";

interface LoginResponse {
    token: string;
}

interface UserProfile {
    id: number;
    metric: boolean;
    height: number;
    weight: number;
    age: number;
}

export default function Home() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function routeAfterLogin() {
        const profileResponse = await AuthGetRequest<UserProfile>("/api/profile");

        if (profileResponse.data) {
            router.push("/dashboard");
            return;
        }

        if (profileResponse.error === "Profile not found") {
            router.push("/profile");
            return;
        }

        localStorage.removeItem("token");
        setErrorMessage(profileResponse.error || "Unable to verify account.");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setErrorMessage(null);

        const loginResponse = await PostRequest<LoginResponse>("/account/login", {
            identifier,
            password,
        });

        if (loginResponse.error) {
            setLoading(false);
            setErrorMessage(loginResponse.error);
            return;
        }

        if (!loginResponse.data) {
            setLoading(false);
            setErrorMessage("Login failed.");
            return;
        }

        localStorage.setItem("token", loginResponse.data.token);
        await routeAfterLogin();

        setLoading(false);
    }

    return (
        <div className={styles.page}>
            <main className={styles.intro}>
                <h1>Welcome to TriForm</h1>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <h2>Login</h2>

                        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

                        <input
                            className={styles.inputField}
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Email or Username"
                            required
                        />

                        <input
                            className={styles.inputField}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />

                        <button className={styles.primaryButton} type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className={styles.ctas}>
                        <a className={styles.secondary} href="/register">
                            Sign up
                        </a>
                    </div>
                </div>

                <div className={styles.ctas}>
                    <a
                        className={styles.primary}
                        href="https://github.com/ludwiga5/TriForm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Check out the GitHub
                    </a>
                </div>
            </main>
        </div>
    );
}