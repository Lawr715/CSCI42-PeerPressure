'use server'
import Form from "next/form";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PomodoroForm( userId: string, focusTime: number, restTime: number, formData: FormData ){

    try {
        "use server";
        //const focusTime = Number(formData.get("focusTime"));
        //const restTime = Number(formData.get("restTime"));
        const result = await prisma.pomodoroInteraction.create({
        data: {
            focusTime: focusTime,
            restTime: restTime,
            userId: userId,
        },
        });
        revalidatePath("/Pomodoro")
    } catch (error: any){
        console.error("Prisma Error:", error.message);
        console.error("Error Code:", error.code);
    }

    
}

export async function PomodoroSettings( userId: string ){
    const settings = await prisma.pomodoroInteraction.findMany({
        take: 1,
        orderBy: [{createdAt: "desc",},],
        where: { userId: userId },
    });
    return settings
}