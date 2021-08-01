import { CacheCommand } from './cache-test.command';
import { CoinFlipCommand } from './flip-coin.command';
import { DiceCommand } from './dice.command';
import { GetReadersCommand } from './get-readers.command';
import { MentionByStatusCommand } from './mention-by-status.command';
import { MentionEntireRoomCommand } from './mention-entire-room.command';
import { Module } from '@nestjs/common';
import { OrnnRedisModule } from '@lib/redis';
import { ParamTestCommand } from './param-test.command';
import { PartyCommands } from './party.command';
import { RegisterChannelCommand } from './register-channel.command';
import { SyncChannelCommand } from './sync-channel.command';

@Module({
  imports: [OrnnRedisModule],
  providers: [
    DiceCommand,
    CoinFlipCommand,
    CacheCommand,
    ParamTestCommand,
    GetReadersCommand,
    RegisterChannelCommand,
    SyncChannelCommand,
    MentionEntireRoomCommand,
    MentionByStatusCommand,
    ...PartyCommands,
  ],
  exports: [
    DiceCommand,
    CoinFlipCommand,
    CacheCommand,
    ParamTestCommand,
    GetReadersCommand,
    RegisterChannelCommand,
    SyncChannelCommand,
    MentionEntireRoomCommand,
    MentionByStatusCommand,
    ...PartyCommands,
  ],
})
export class KakaoTalkCommandModule {}
