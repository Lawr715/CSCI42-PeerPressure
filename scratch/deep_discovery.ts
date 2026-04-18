import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function discoverAuthorizedModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY missing");
        return;
    }

    try {
        console.log("Attempting to list authorized models via REST...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data: any = await response.json();
        
        if (data.models) {
            console.log("✅ AUTHORIZED MODELS FOUND:");
            data.models.forEach((m: any) => console.log(` - ${m.name}`));
        } else if (data.error) {
            console.log("❌ API ERROR RESPONSE:");
            console.log(JSON.stringify(data.error, null, 2));
        } else {
            console.log("❌ UNKNOWN RESPONSE STATE:", JSON.stringify(data, null, 2));
        }

    } catch (error: any) {
        console.error("Critical Discovery Failure:", error.message);
    }
}

discoverAuthorizedModels();
