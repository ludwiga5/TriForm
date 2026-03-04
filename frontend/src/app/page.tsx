"use client";
import styles from "./page.module.css";
import { useState } from "react";
import { PostRequest } from "@/lib/api-helper";
import { text } from "stream/consumers";

interface LoginResponse{
    token: string;
}

export default function Home(){
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
  
          const response = await PostRequest<LoginResponse>(
              "/account/login", 
              {identifier, password}
          );
  
          //Check for and output Error
          if (response.error){
              console.log(response.error);
              setErrorMessage(response.error);
          }
          //Passes and stores the JWT Token
          if (response.data){
              console.log("token: ", response.data.token);
              localStorage.setItem("token", response.data.token);
              setErrorMessage(null);
          }
      };

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
            <button className={styles.primaryButton} type="submit">Login</button>
          </form>
          <div className={styles.ctas}>
            <a className={styles.secondary} href="/register">
                Sign up
            </a>
          </div>
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary}
             href="https://github.com/ludwiga5/TriForm" 
             target="_blank" 
             rel="noopener noreferrer">
            Check out the GitHub
          </a>
        </div>

        </main>
    </div>
  );
}
