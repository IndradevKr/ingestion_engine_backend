import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FetchContactsQuery } from "../fetch-contacts.query";
import { ContactsRepository } from "src/contacts/repositories/contacts.repository";

@QueryHandler(FetchContactsQuery)
export class FetchContactsHandler implements IQueryHandler<FetchContactsQuery> {
    constructor(private readonly contactsRepository: ContactsRepository) {}

    async execute(query: FetchContactsQuery): Promise<any> {
        return await this.contactsRepository.findAll();
    }
}