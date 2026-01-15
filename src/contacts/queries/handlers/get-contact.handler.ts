import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetContactQuery } from "../get-contact.query";
import { ContactsRepository } from "../../repositories/contacts.repository";

@QueryHandler(GetContactQuery)
export class GetContactHandler implements IQueryHandler<GetContactQuery> {
    constructor(private readonly contactsRepository: ContactsRepository) { }

    async execute(query: GetContactQuery): Promise<any> {
        return await this.contactsRepository.findOne(query.id);
    }
}
