import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateContactsRequest } from './commands/requests/create-contacts.request';
import { CreateContactsCommand } from './commands/create-contacts.command';
import { FetchContactsQuery } from './queries/fetch-contacts.query';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUES } from 'src/queues/queues.constant';
import { Queue } from 'bullmq';

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
}
