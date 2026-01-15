import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateContactsRequest } from './commands/requests/create-contacts.request';
import { CreateContactsCommand } from './commands/create-contacts.command';
import { UpdateContactCommand } from './commands/update-contact.command';
import { FetchContactsQuery } from './queries/fetch-contacts.query';
import { GetContactQuery } from './queries/get-contact.query';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUES } from 'src/queues/queues.constant';
import { Queue } from 'bullmq';
import { Contacts } from './entities/contacts.entitiy';

@Controller('contacts')
export class ContactsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @InjectQueue(QUEUES.CONTACTS) private readonly contactqueue: Queue,
    ) { }

    @Post()
    async createTask(@Body() body: CreateContactsRequest) {
        const contact = await this.commandBus.execute(new CreateContactsCommand(body))
        await this.contactqueue.add('added-contact', { contact }, {
            removeOnComplete: true,
            removeOnFail: false,
        })
        return contact
    }

    @Get()
    async fetchAllContacts() {
        return this.queryBus.execute(new FetchContactsQuery())
    }

    @Get(':id')
    async fetchContact(@Param('id') id: string) {
        return this.queryBus.execute(new GetContactQuery(id))
    }

    @Put(':id')
    async updateContact(@Param('id') id: string, @Body() body: Partial<Contacts>) {
        return this.commandBus.execute(new UpdateContactCommand(id, body))
    }
}
