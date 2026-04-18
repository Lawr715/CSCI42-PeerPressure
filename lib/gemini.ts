import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    return new GoogleGenerativeAI(apiKey);
};

export async function generateWeeklySummary(data: {
    userId: string;
    userName: string;
    completedTasks: any[];
    delayedTasks: any[];
    focusTime: string;
    meetings: any[];
}) {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `
        You are the Sovereign Executive Assistant for a high-performance workspace. 
        Your goal is to analyze the user's weekly productivity and provide a tactical, structured summary.

        USER DATA:
        - Name: ${data.userName}
        - Focus Window: ${data.focusTime}
        - Completed Tasks: ${data.completedTasks.map(t => `${t.taskName} (${t.taskDescription || 'No description'})`).join(", ")}
        - Overdue Tasks: ${data.delayedTasks.map(t => `${t.taskName} (Due: ${t.hardDeadline})`).join(", ")}
        - Peer Meetings: ${data.meetings.map(m => m.meetingName).join(", ")}

        ANALYSIS GUIDELINES:
        1. Be bold, tactical, and encouraging.
        2. Identify the "Critical Path" - the most important thing they missed or should do next.
        3. Suggest a specific focus strategy based on their focus time (${data.focusTime}).
        4. Calculate a productivity score (1-100) based on completions vs overdue.

        OUTPUT FORMAT (JSON ONLY):
        {
            "score": number,
            "aiSummary": "A 2-3 sentence narrative of the week of ${data.userName}",
            "topBlocker": "Identifying the single biggest bottleneck",
            "tacticalAdvice": ["Step 1", "Step 2", "Step 3"],
            "theme": "A one-word vibe for the week"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error: any) {
        console.error("DEBUG: FULL GEMINI ERROR:", JSON.stringify(error, null, 2));
        console.error("Gemini AI Generation Error:", error.message);
        
        let reason = "Synchronization Node Offline";
        if (error.message?.includes("not found")) reason = "Model Protocol Mismatch (Check Enablement)";
        if (error.message?.includes("API key")) reason = "Credential Integrity Breach";

        return {
            score: 0,
            aiSummary: `The intelligence layer is currently in fallback mode. Reason: ${reason}`,
            topBlocker: "API Handshake Failure",
            tacticalAdvice: ["Verify Generative Language API is enabled", "Restart dev server", "Check .env key accuracy"],
            theme: "Offline"
        };
    }
}
