import { DiceCommand } from './dice.command';
import { CoinFlipCommand } from './flip-coin.command';
import { MentionEntireRoomCommand } from './mention-entire-room.command';
import { ParamTestCommand } from './param-test.command';
import { RegisterChannelCommand } from './register-channel.command';
import { SyncChannelCommand } from './sync-channel.command';

export const kakaoCommands = [
  CoinFlipCommand,
  // GetReadersCommand,
  DiceCommand,
  ParamTestCommand,
  RegisterChannelCommand,
  SyncChannelCommand,
  MentionEntireRoomCommand,
];
