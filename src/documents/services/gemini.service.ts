import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai'
import { geminiConfig } from 'src/config/gemini.config';

import * as os from 'os';

@Injectable()
export class GeminiService {
    private readonly apiKey: string;
    private ai: GoogleGenAI;

    constructor() {
        this.apiKey = geminiConfig.apiKey;

        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        this.ai = new GoogleGenAI({
            apiKey: this.apiKey
        });
    }

    async generateResponse(prompt: string): Promise<string | undefined> {
        try {
            const result = await this.ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt
            });
            return result.text;
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

    // async getJsonOutput(prompt: string): Promise<any> {
    //     try {
    //         const model = this.ai.models.generateContent({
    //             model: "gemini-2.5-flash",
    //             config: { responseMimeType: "application/json" },
    //         });

    //         const result = await model.generateContent(prompt);
    //         return JSON.parse(result.response.text());
    //     } catch (error) {
    //         console.error("Gemini API Error:", error);
    //         throw new Error('Failed to get JSON output');
    //     }
    // }

    async classifyDocument(fileBuffer: Buffer, mimeType: string): Promise<any> {
        console.log('Classifying document with Gemini AI');

        // Create a temporary file path
        const tempFilePath = os.tmpdir() + '/gemini-' + Date.now().toString();
        console.log('Temporary file path:', tempFilePath);

        // Write the buffer to the temporary file asynchronously
        await new Promise((resolve, reject) => {
            fs.writeFile(tempFilePath, fileBuffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('file created');
                }
            });
        });

        console.log('File written to temporary location');

        try {
            // Enhanced prompt for education CRM document classification
            const prompt = `You are a document classifier for an education CRM system used by education counselors.
                VALID DOCUMENT TYPES for this system:
                1. "resume" - Student CV/Resume with education and work experience
                2. "transcript" - Academic transcripts, marksheets, grade reports
                3. "coe" - Certificate of Enrollment from current/previous institution
                4. "test_score" - Standardized test scores (IELTS, TOEFL, GRE, GMAT, SAT, etc.)
                5. "passport" - Passport or government-issued ID
                6. "financial_document" - Bank statements, financial aid documents
                7. "irrelevant" - Document is not relevant to the education CRM system


                Analyze this document and respond with ONLY valid JSON (no markdown, no code blocks):
                {
                "documentType": "resume|transcript|coe|test_score|financial_document|irrelevant",
                "confidence": 0.95,
                "isRelevant": true,
                "reason": "Brief explanation of classification"
                }

                IMPORTANT:
                - If the document is NOT one of the valid types above, set documentType to "irrelevant" and isRelevant to false
                - If you cannot determine the type with reasonable confidence, set documentType to "irrelevant"
                - Respond with ONLY the JSON object, no additional text`;

            const uploadedFile = await this.ai.files.upload({
                file: tempFilePath,
                config: { mimeType: mimeType }
            });

            if (!uploadedFile.uri || !uploadedFile.mimeType) {
                console.error('Uploaded file does not have a valid URI or mimetype:', uploadedFile);
                throw new Error('Failed to upload file');
            }

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: createUserContent([
                    createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
                    prompt
                ]),
                config: {
                    responseMimeType: 'application/json'
                }
            });

            if (!response.text) {
                throw new Error('Gemini returned empty response');
            }

            // Parse and validate the JSON response
            const classification = JSON.parse(response.text);

            return classification;

        } catch (error) {
            console.error('Error processing document with Gemini:', error);
            throw error;
        } finally {
            // Clean up temporary file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('Temporary file cleaned up');
            }
        }
    }
}
