import { ConfigModule } from '@nestjs/config';
import { DiscordWebhookService } from './discord-webhook.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
  ],
  providers: [DiscordWebhookService],
  exports: [DiscordWebhookService],
})
export class WebhookModule {}
