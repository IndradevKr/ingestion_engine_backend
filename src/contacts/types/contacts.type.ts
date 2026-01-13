export interface IApplicationSummaryTypePayload {
    startDate?: string;
    endDate?: string;
    initialTutionFee?: string;
    totalTutionFee?: string;
}

export interface IApplicationSummary {
    type: string;
    values: IApplicationSummaryTypePayload;
}

export interface IProfessionalExperience {
    jobTitle?: string;
    organizationName?: string;
    isStillWorking?: boolean;
    startDate?: string;
    endDate?: string;
}

export interface IEducationBackground {
    institution?: string;
    degreeTitle?: string;
    courseStart?: string;
    courseEnd?: string;
    securedGpa?: number;
    totalGpa?: number;
    percentage?: number;
}

export type TestType =  "ielts" | "toefl" | "pte";
export interface ILangBandScores {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
    overall: number;
}

export interface ILanguageTestScores {
    testType: TestType;
    scores: ILangBandScores;
}