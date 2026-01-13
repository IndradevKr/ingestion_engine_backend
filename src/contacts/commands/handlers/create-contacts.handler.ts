import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateContactsCommand } from "../create-contacts.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Contacts } from "src/contacts/entities/contacts.entitiy";
import { Repository } from "typeorm";
import { CreateContactsRequest } from "../requests/create-contacts.request";
import { ContactsRepository } from "src/contacts/repositories/contacts.repository";

@Injectable()
@CommandHandler(CreateContactsCommand)
export class CreateContactsHandler implements ICommandHandler<CreateContactsCommand> {
    constructor(
        private readonly contactsRepository: ContactsRepository
    ){}

    async execute(command: CreateContactsCommand): Promise<any> {
        return await this.contactsRepository.create(command.data)
    }
}
