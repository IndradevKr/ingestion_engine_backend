import { IQuery } from "@nestjs/cqrs";

export class GetContactQuery implements IQuery {
    constructor(public readonly id: string) { }
}
