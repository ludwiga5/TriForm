"use client";

import { useState } from "react";
import { PostRequest } from "@/lib/api-helper";

interface RegisterResponse{
    message: string;
}

export default function RegisterPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleClick = async () => {

        const response = await PostRequest<RegisterResponse>(
            "/auth/register", 
            {username, email, password }
        );
        //Check for and output Error
        if (response.error){
            console.log(response.error);
        }
        //Passes and stores the JWT Token
        if (response.data){
            console.log("Successful Registration", response.data.message);
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