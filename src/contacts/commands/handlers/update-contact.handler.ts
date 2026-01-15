import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateContactCommand } from "../update-contact.command";
import { ContactsRepository } from "../../repositories/contacts.repository";

@CommandHandler(UpdateContactCommand)
export class UpdateContactHandler implements ICommandHandler<UpdateContactCommand> {
    constructor(private readonly contactsRepository: ContactsRepository) { }

    async execute(command: UpdateContactCommand): Promise<any> {
        return await this.contactsRepository.update(command.id, command.data);
    }
}
