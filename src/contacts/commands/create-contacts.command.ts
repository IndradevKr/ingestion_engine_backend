import { Address } from "../types/contacts.request.type";
import { IApplicationSummary, IEducationBackground, ILanguageTestScores, IProfessionalExperience } from "../types/contacts.type";

export interface ContactPayload {
    firstName: string;
    lastname?: string;
    email: string;
    phone?: string;
    countryCode?: string;
    addressLineOne?: string;
    applicationSummary?: IApplicationSummary;
    professionalExperiences?: IProfessionalExperience[];
    educationBackgrounds?: IEducationBackground[];
    languageTestScores?: ILanguageTestScores[];
    address?: Address;
}

export class CreateContactsCommand {
    readonly data: ContactPayload[]
    constructor(
        ...data: ContactPayload[]
    ) {
        this.data = data;
    }
}