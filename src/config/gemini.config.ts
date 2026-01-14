import {config} from "dotenv";

config();

export const geminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || ''
}