'use server'
import Form from "next/form";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PomodoroForm(formData: FormData){

    try {
        "use server";
        const focusTime = Number(formData.get("focusTime"));
        const restTime = Number(formData.get("restTime"));
        const result = await prisma.pomodoroInteraction.create({
        data: {
            focusTime,
            restTime,
            userId: "keuUoY5q7sHT355pLyXSUIo541kKvV6R",
        },
        });
        
        console.log("Success! Data saved:", result);
        revalidatePath("/Pomodoro")
    } catch (error: any){
        console.error("Prisma Error:", error.message);
        console.error("Error Code:", error.code);
    }

    
}