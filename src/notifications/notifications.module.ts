import { Module, Global } from '@nestjs/common';
import { LiveUpdatesGateway } from './gateways/live-updates.gateway';

@Global()
@Module({
    providers: [LiveUpdatesGateway],
    exports: [LiveUpdatesGateway],
})
export class NotificationsModule { }
