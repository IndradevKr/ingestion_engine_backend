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
                Your task is to classify the document using its content only. Do not use filename or metadata to classify the document.
                
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
                    createPartFromUri(uploadedFile.uri!, uploadedFile.mimeType!),
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

    async extractDocumentData(fileBuffer: Buffer, mimeType: string, schema: any): Promise<any> {
        console.log('Extracting structured data from document with Gemini AI');

        // Create a temporary file path
        const tempFilePath = os.tmpdir() + '/gemini-extract-' + Date.now().toString();

        // Write the buffer to the temporary file
        await new Promise((resolve, reject) => {
            fs.writeFile(tempFilePath, fileBuffer, (err) => {
                if (err) reject(err);
                else resolve('file created');
            });
        });

        try {
            const prompt = `You are a high-precision data extraction expert for an education CRM.
                Your task is to extract ALL relevant information from the provided document into the exact JSON format specified by the schema.
                Output must be ONLY valid JSON matching the schema.

                IMPORTANT GUIDELINES:
                1. Extract names, contact details, work experience, education history, and test scores.
                2. For every field, provide a confidence score (0.0 to 1.0) and a bbox as an array [ymin, xmin, ymax, xmax, page].
                3. Bounding boxes should be normalized (0 to 1000) based on page coordinates.
                4. If a piece of information is missing, do not include it in the JSON.
                6. Ensure all dates are in YYYY-MM-DD format. If the date is not present, do not include it in the JSON.
                7. Focus on extreme accuracy for GPA and Test Scores.

                Non-negotiable constraints:
                    - Do NOT hallucinate or fabricate any data.
                    - Do NOT infer values that are not present in the document.
                    - Do NOT classify documents using filename or metadata; use content only.
                    - Do NOT attempt verification for documents classified as "Other" or "irrelevant".
                    - Do NOT output any verification or status flags before extraction is complete.

                General extraction rules:
                    - Omit fields that are not clearly present.
                    - Every extracted field must include value, confidence, and bbox.
                    - bbox must tightly match the detected text and correct page.
                    - Do not create empty objects or empty arrays.

                Address rules:
                    - If full address appears as a single line, extract it into addressLineOne.
                    - Extract individual parts (city, country) into their respective top-level fields if detectable.
                    - Do not invent missing address parts.

                Name extraction rules:
                    - If a full name is present, split into firstName and lastName.
                    - If only one name is present, put it in firstName and omit lastName.
                    - Do not guess missing name parts.
                
                Phone extraction rules:
                    - Extract numeric phone numbers even if labeled as mobile, contact, tel, or not labeled.
                    - Extract country code separately if present (e.g. +1, +91).
                    - Do not include spaces or dashes in value.
                
                Date rules:
                    - All dates must be normalized to format YYYY-MM-DD.
                    - If day is missing, use 01.
                    - If month is missing, use 01.
                    - If date cannot be confidently parsed, omit the field.
                
                Success criteria:
                   - Accurate classification based on content.
                   - Reliable and precise extraction.
                   - Precise hover highlighting using bounding boxes.
                   - Transparent and consistent confidence scoring.
                   - Clear verification flow driven by extracted confidence values.
                
                Response must be a valid JSON object matching the provided schema exactly.`;

            const uploadedFile = await this.ai.files.upload({
                file: tempFilePath,
                config: { mimeType: mimeType }
            });

            if (!uploadedFile.uri || !uploadedFile.mimeType) {
                throw new Error('Failed to upload file');
            }

            const response = await this.ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: createUserContent([
                    createPartFromUri(uploadedFile.uri!, uploadedFile.mimeType!),
                    prompt
                ]),
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema
                }
            });

            if (!response.text) {
                throw new Error('Gemini returned empty extraction response');
            }

            return JSON.parse(response.text);

        } catch (error) {
            console.error('Error extracting data with Gemini:', error);
            throw error;
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    }
}
