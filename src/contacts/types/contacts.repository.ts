import { CreateContactsCommand } from "../commands/create-contacts.command";
import { CreateContactsRequest } from "../commands/requests/create-contacts.request";
import { Contacts } from "../entities/contacts.entitiy";

export interface IContactsRepository {
    create(data: CreateContactsRequest[]);
    findAll(): Promise<Contacts[] | null>;
    findOne(id: string): Promise<Contacts | null>;
    update(id: string, data: Partial<Contacts>): Promise<Contacts | null>;
}