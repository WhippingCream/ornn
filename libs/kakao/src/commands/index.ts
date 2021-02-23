import { DiceCommand } from './dice.command';
import { CoinFlipCommand } from './flip-coin.command';
import { GetReadersCommand } from './get-readers.command';
import { ParamTestCommand } from './param-test.command';

export const kakaoCommands = [
  CoinFlipCommand,
  GetReadersCommand,
  DiceCommand,
  ParamTestCommand,
];
