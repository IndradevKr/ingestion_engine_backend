import { Injectable } from "@nestjs/common";
import { IContactsRepository } from "../types/contacts.repository";
import { Contacts } from "../entities/contacts.entitiy";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateContactsRequest } from "../commands/requests/create-contacts.request";

@Injectable()
export class ContactsRepository implements IContactsRepository {
    constructor(
        @InjectRepository(Contacts)
        private contactsRepository: Repository<Contacts>
    ) { }

    create(data: CreateContactsRequest[]) {
        return this.contactsRepository.save(data);
    }

    findAll(): Promise<Contacts[] | null> {
        return this.contactsRepository.find();
    }

    findOne(id: string): Promise<Contacts | null> {
        return this.contactsRepository.findOneBy({ id });
    }

    async update(id: string, data: Partial<Contacts>): Promise<Contacts | null> {
        await this.contactsRepository.update(id, data);
        return this.contactsRepository.findOneBy({ id });
    }
}