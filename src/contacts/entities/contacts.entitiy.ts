import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { type IProfessionalExperience, type IApplicationSummary, type IEducationBackground, ILanguageTestScores } from "../types/contacts.type";
import { Type } from "class-transformer";
import { Address, ApplicationSummary, EducationBackground, LanguageTestScore, ProfessionalExperience } from "../types/contacts.request.type";

@Entity('contacts')
export class Contacts {
    constructor(partial: Partial<Contacts>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @IsNotEmpty()
    @Column({ nullable: false })
    firstName: string;

    @IsNotEmpty()
    @Column({ nullable: true })
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    @Column({ nullable: false })
    email: string;

    @Column({ nullable: true })
    countryCode: string;

    @IsNotEmpty()
    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    addressLineOne: string;

    @Column({ type: 'jsonb' })
    @IsOptional()
    address: Address;

    @IsBoolean()
    @Column()
    isVerified: false;

    @Column({ type: 'jsonb' })
    applicationSummary: ApplicationSummary;

    @Column({ type: "jsonb", name: 'professional_experiences', nullable: true, default: "[]" })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfessionalExperience)
    professionalExperiences: ProfessionalExperience[];

    @Column({ type: 'jsonb', name: 'education_backgrounds', nullable: true, default: "[]" })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationBackground)
    educationBackgrounds: EducationBackground[];

    @Column({ type: 'jsonb', name: 'language_test_scores', nullable: true, default: "[]" })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LanguageTestScore)
    languageTestScores: LanguageTestScore[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}