"use client";

import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostRequest } from "@/lib/api-helper";
import { RegisterResponse } from "@/lib/types";
import { LoginResponse } from "@/lib/types";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        const response = await PostRequest<RegisterResponse>(
            "/account/register",
            { username, email, password }
        );

        setLoading(false);

        if (response.error) {
            setErrorMessage(response.error);
            return;
        }

    if (response.data) {
        // Login immediately after registration
        const loginResponse = await PostRequest<LoginResponse>(
            "/account/login",
            { identifier: username, password }
        );
        if (loginResponse.data) {
            localStorage.setItem("token", loginResponse.data.token);
            router.push("/profile");
        }
    }
    };

    return (
        <div className={styles.page}>
            <main className={styles.intro}>
                <h1>Join TriForm</h1>
                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <h2>Create Account</h2>
                        {errorMessage && (
                            <div className={styles.error}>{errorMessage}</div>
                        )}
                        <input
                            className={styles.inputField}
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            className={styles.inputField}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            className={styles.inputField}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            className={styles.primaryButton}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Register"}
                        </button>
                    </form>
                    <div className={styles.ctas}>
                        <a className={styles.secondary} href="/">
                            Back to Login
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
