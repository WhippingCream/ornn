import { CacheCommand } from './cache-test.command';
import { CoinFlipCommand } from './flip-coin.command';
import { DiceCommand } from './dice.command';
import { GetReadersCommand } from './get-readers.command';
import { MentionByStatusCommand } from './mention-by-status.command';
import { MentionEntireRoomCommand } from './mention-entire-room.command';
import { Module } from '@nestjs/common';
import { OrnnRedisModule } from '@lib/redis';
import { PartyCreateCommand } from './party-create.command';
import { PartyExitCommand } from './party-exit.command';
import { PartyJoinCommand } from './party-join.command';
import { PartyKickCommand } from './party-kick.command';
import { PartyListCommand } from './party-list.command';
import { PartyModule } from '@lib/party';
import { PartyNameCommand } from './party-name.command';
import { PartyTimeCommand } from './party-time.command';
import { PartyTypeCommand } from './party-type.command';
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
    PartyListCommand,
    PartyCreateCommand,
    PartyJoinCommand,
    PartyExitCommand,
    PartyKickCommand,
    PartyNameCommand,
    PartyTimeCommand,
    PartyTypeCommand,
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
    PartyListCommand,
    PartyCreateCommand,
    PartyJoinCommand,
    PartyExitCommand,
    PartyKickCommand,
    PartyNameCommand,
    PartyTimeCommand,
    PartyTypeCommand,
  ],
})
export class KakaoTalkCommandModule {}
