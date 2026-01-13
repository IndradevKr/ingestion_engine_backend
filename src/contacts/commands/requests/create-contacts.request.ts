import { Type } from "class-transformer";
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApplicationSummary, EducationBackground, LanguageTestScore, ProfessionalExperience } from "src/contacts/types/contacts.request.type";

export class CreateContactsRequest {
    @IsString()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    countryCode?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    addressLineOne?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ApplicationSummary)
    applicationSummary?: ApplicationSummary;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfessionalExperience)
    professionalExperiences?: ProfessionalExperience[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationBackground)
    educationBackgrounds?: EducationBackground[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LanguageTestScore)
    languageTestScores?: LanguageTestScore[];
}