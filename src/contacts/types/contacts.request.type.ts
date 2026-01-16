import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { type TestType } from './contacts.type';

export class LangBandScores {
    @IsNumber()
    @Min(0)
    @Max(90)
    reading: number;

    @IsNumber()
    @Min(0)
    @Max(90)
    writing: number;

    @IsNumber()
    @Min(0)
    @Max(90)
    listening: number;

    @IsNumber()
    @Min(0)
    @Max(90)
    speaking: number;

    @IsNumber()
    @Min(0)
    overall: number;
}

export class LanguageTestScore {
    @IsString()
    testType: TestType;

    @ValidateNested()
    @Type(() => LangBandScores)
    scores: LangBandScores;
}

export class ProfessionalExperience {
    @IsString()
    jobTitle?: string;

    @IsString()
    organizationName?: string;

    @IsString()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isStillWorking?: boolean;
}

export class EducationBackground {
    @IsString()
    @IsOptional()
    institution?: string;

    @IsString()
    @IsOptional()
    degreeTitle?: string;

    @IsDateString()
    @IsOptional()
    courseStart?: string;

    @IsDateString()
    @IsOptional()
    courseEnd?: string;

    @IsString()
    @IsOptional()
    securedGpa?: string;

    @IsString()
    @IsOptional()
    totalGpa?: string;

    @IsString()
    @IsOptional()
    percentage?: string;
}

export class ApplicationSupportingData {
    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    initialTutionFee?: string;

    @IsOptional()
    @IsString()
    totalTutionFee?: string;
}

export class ApplicationSummary {
    @IsString()
    @IsOptional()
    type?: string;

    @ValidateNested()
    @Type(() => ApplicationSupportingData)
    values: ApplicationSupportingData;
}

export class Address {
    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    country?: string;
}