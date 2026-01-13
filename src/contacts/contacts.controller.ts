import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateContactsRequest } from './commands/requests/create-contacts.request';
import { CreateContactsCommand } from './commands/create-contacts.command';
import { FetchContactsQuery } from './queries/fetch-contacts.query';

@Controller('contacts')
export class ContactsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    @Post()
    async createTask(@Body() body: CreateContactsRequest) {
        return this.commandBus.execute(new CreateContactsCommand(body))
    }

    @Get()
    async fetchAllContacts() {
        return this.queryBus.execute(new FetchContactsQuery())
    }
}
