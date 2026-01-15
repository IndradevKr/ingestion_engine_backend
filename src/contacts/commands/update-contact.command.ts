import { ICommand } from "@nestjs/cqrs";
import { Contacts } from "../entities/contacts.entitiy";

export class UpdateContactCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: Partial<Contacts>
    ) { }
}
