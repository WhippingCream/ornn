import { DiceCommand } from './dice.command';
import { CoinFlipCommand } from './flip-coin.command';
import { ParamTestCommand } from './param-test.command';
import { RegisterChannelCommand } from './register-room.command';

export const kakaoCommands = [
  CoinFlipCommand,
  // GetReadersCommand,
  DiceCommand,
  ParamTestCommand,
  RegisterChannelCommand,
];
