import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';

@Module({
  providers: [DiscordBotService],
  exports: [DiscordBotService],
})
export class DiscordBotModule {}
