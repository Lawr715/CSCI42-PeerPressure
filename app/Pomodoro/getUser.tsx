'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 

export function getUser(){
    const router = useRouter(); 
    const { data: session, isPending } = useSession(); 
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/Login"); 
        } 
    }, [isPending, session, router]); 

    if (isPending)
    return <p className="text-center mt-8 text-white">Loading...</p>;

    return session?.user;
}