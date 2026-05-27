"use client";

import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostRequest } from "@/lib/api-helper";
import { RegisterResponse, LoginResponse } from "@/lib/types";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setErrorMessage(null);

        const registerResponse = await PostRequest<RegisterResponse>("/account/register", {
            username,
            email,
            password,
        });

        if (registerResponse.error) {
            setLoading(false);
            setErrorMessage(registerResponse.error);
            return;
        }

        const loginResponse = await PostRequest<LoginResponse>("/account/login", {
            identifier: username,
            password,
        });

        if (loginResponse.error) {
            setLoading(false);
            setErrorMessage(loginResponse.error);
            return;
        }

        if (!loginResponse.data) {
            setLoading(false);
            setErrorMessage("Account created, but login failed.");
            return;
        }

        localStorage.setItem("token", loginResponse.data.token);
        router.push("/profile");
    }

    return (
        <div className={styles.page}>
            <main className={styles.intro}>
                <h1>Join TriForm</h1>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <h2>Create Account</h2>

                        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

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

                        <button className={styles.primaryButton} type="submit" disabled={loading}>
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