import { CacheCommand } from './cache-test.command';
import { CoinFlipCommand } from './flip-coin.command';
import { DiceCommand } from './dice.command';
import { GetReadersCommand } from './get-readers.command';
import { MentionByStatusCommand } from './mention-by-status.command';
import { MentionEntireRoomCommand } from './mention-entire-room.command';
import { Module } from '@nestjs/common';
import { OrnnRedisModule } from '@lib/redis';
import { PartyCommand } from './party.command';
import { PartyModule } from '@lib/party';
import { RegisterChannelCommand } from './register-channel.command';
import { SyncChannelCommand } from './sync-channel.command';

@Module({
  imports: [OrnnRedisModule, PartyModule],
  providers: [
    DiceCommand,
    CoinFlipCommand,
    CacheCommand,
    GetReadersCommand,
    RegisterChannelCommand,
    SyncChannelCommand,
    MentionEntireRoomCommand,
    MentionByStatusCommand,
    PartyCommand,
  ],
  exports: [
    DiceCommand,
    CoinFlipCommand,
    CacheCommand,
    GetReadersCommand,
    RegisterChannelCommand,
    SyncChannelCommand,
    MentionEntireRoomCommand,
    MentionByStatusCommand,
    PartyCommand,
  ],
})
export class KakaoTalkCommandModule {}
