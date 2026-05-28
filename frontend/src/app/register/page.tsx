"use client";

import styles from "./register.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostRequest } from "@/lib/api-helper";

interface RegisterResponse {
    message: string;
}

interface LoginResponse {
    token: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setErrorMessage(null);

        if (!username.trim()) {
            setErrorMessage("Enter a username.");
            return;
        }

        if (!email.trim()) {
            setErrorMessage("Enter an email.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        const registerResponse = await PostRequest<RegisterResponse>("/account/register", {
            username: username.trim(),
            email: email.trim(),
            password,
        });

        if (registerResponse.error) {
            setLoading(false);
            setErrorMessage(registerResponse.error);
            return;
        }

        const loginResponse = await PostRequest<LoginResponse>("/account/login", {
            identifier: username.trim(),
            password,
        });

        setLoading(false);

        if (loginResponse.error || !loginResponse.data?.token) {
            setErrorMessage(loginResponse.error || "Account created, but login failed.");
            return;
        }

        localStorage.setItem("token", loginResponse.data.token);
        router.push("/profile");
    }

    return (
        <div className={styles.page}>
            <main className={styles.shell}>
                <section className={styles.hero}>
                    <p className={styles.kicker}>Start Training</p>
                    <h1>Create Account</h1>
                    <p className={styles.subtitle}>
                        Build your athlete profile, log your training, and generate race-specific triathlon plans.
                    </p>
                </section>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2>Register</h2>

                        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Username</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Email</label>
                            <input
                                className={styles.inputField}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Password</label>
                            <input
                                className={styles.inputField}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Confirm Password</label>
                            <input
                                className={styles.inputField}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className={styles.primaryButton} type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </button>

                        <p className={styles.switchText}>
                            Already have an account? <a href="/">Log in</a>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}