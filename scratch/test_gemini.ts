import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from the root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key setup...");
    
    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing from .env");
        return;
    }

    console.log("API Key found. Initializing Gemini Client...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Sending test prompt: 'Hello, are you operational?'");
        const result = await model.generateContent("Hello, are you operational?");
        const response = await result.response;
        const text = response.text();
        console.log("✅ SUCCESS! Gemini Response:", text);
    } catch (error: any) {
        console.error("❌ ERROR: Gemini Connection Failed.");
        console.error("Message:", error.message);
        if (error.status === 400) console.error("Note: This often means the API key is restricted or the model name is incorrect.");
    }
}

testGemini();
