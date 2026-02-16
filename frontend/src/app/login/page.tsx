"use client";

import { useState } from "react";
import { PostRequest } from "@/lib/api-helper";

interface LoginResponse{
    token: string;
}

export default function LoginPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleClick = async () => {

        const response = await PostRequest<LoginResponse>(
            "/auth/login", 
            {username, email, password}
        );

        //Check for and output Error
        if (response.error){
            console.log(response.error);
        }
        //Passes and stores the JWT Token
        if (response.data){
            console.log("token: ", response.data.token);
            localStorage.setItem("token", response.data.token);
        }
};

return (
    <div>
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

        <button type="button" onClick={handleClick}>Register</button>
    </div>
);

}