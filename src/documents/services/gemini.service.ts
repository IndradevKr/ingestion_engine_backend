import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from 'src/config/gemini.config';

@Injectable()
export class GeminiService {
    private readonly apiKey: string;
    private readonly modelId: string;
    private model;
    private genAI;

    constructor() {
        this.apiKey = geminiConfig.apiKey;
        this.modelId = 'gemini-3-flash-preview';

        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: this.modelId,
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error('Failed to generate response');
        }
    }

    fileToGenerativePart(path: string, mimeType: string): any {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(path)).toString("base64"),
                mimeType,
            },
        };
    }

    async getJsonOutput(prompt: string): Promise<any> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelId,
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error('Failed to get JSON output');
        }
    }

    async processFile(fileBuffer: Buffer, mimeType: string): Promise<any> {
        if (!fileBuffer) {
            throw new Error('No file buffer provided');
        }

        try {
            if (mimeType.startsWith('image')) {
                return await this.processImage(fileBuffer, mimeType);
            } else if (mimeType === 'application/pdf') {
                return await this.processPdfFile(fileBuffer);
            } else {
                throw new Error(`Unsupported MIME type: ${mimeType}`);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }

    async processImage(imageBuffer: Buffer, mimeType: string): Promise<any> {
        console.log('Processing image buffer');
        const text = imageBuffer.toString(); 
        return await this.getJsonOutput(text);
    }

    async processPdfFile(pdfBuffer: Buffer): Promise<any> {
        console.log('Processing PDF buffer');

        try {
            const text = pdfBuffer.toString();
            return await this.getJsonOutput(text);
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        }
    }
}
