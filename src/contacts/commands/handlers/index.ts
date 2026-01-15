import { CreateContactsHandler } from "./create-contacts.handler";
import { UpdateContactHandler } from "./update-contact.handler";

export const ContactsCommandHandler = [
    CreateContactsHandler,
    UpdateContactHandler
]