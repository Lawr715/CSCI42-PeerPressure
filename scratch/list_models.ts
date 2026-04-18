import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK doesn't have a direct listModels export in the high-level API in all versions
        // but we can try a few common model strings to see what hits.
        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
        
        console.log("Testing model availability...");
        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ ${modelName} is AVAILABLE`);
            } catch (e: any) {
                console.log(`❌ ${modelName} is NOT AVAILABLE (${e.message.split('\n')[0]})`);
            }
        }
    } catch (error) {
        console.error("List transition failed:", error);
    }
}

listModels();
