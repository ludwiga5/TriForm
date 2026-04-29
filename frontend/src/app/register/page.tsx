"use client";

import styles from "../page.module.css";
import { useState } from "react";
import { PostRequest } from "@/lib/api-helper";

interface RegisterResponse{
    message: string;
}

export default function RegisterPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await PostRequest<RegisterResponse>(
            "/account/register", 
            {username, email, password }
        );
        //Check for and output Error
        if (response.error){
            console.log("Error:", response.error);
        }
        //Passes and stores the JWT Token
        if (response.data){
            console.log("Successful Registration", response.data.message);
        }
    
};

return (

    <div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
            <input 
                type="text"
                placeholder="username"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
            />

            <input 
                type="email"
                placeholder="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit">Register</button>
        </form>
    </div>

);

}