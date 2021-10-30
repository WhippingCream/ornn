import { TalkChannel, TalkChatData } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoCommand } from './base.command';
import { converters } from '@lib/kakao/utils';

@Injectable()
export class DiceCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'dice',
      aliases: ['주사위'],
      helpMessage: [
        '/주사위',
        ' - 1부터 6 중 하나의 숫자가 나옵니다.',
        '/주사위 N',
        ' - N: 1보다 큰 양의 정수',
        ' - 1부터 N 중 하나의 숫자가 나옵니다.',
      ].join('\n'),
    });
  }

  execute = (data: TalkChatData, channel: TalkChannel, args: string[]) => {
    let max = 6;

    const num = converters.str2num(args[0]);

    if (num !== null) {
      if (num > 1) {
        max = num;
      }
    }

    let result = `${Math.ceil(Math.random() * max)}`;

    if (max < 7) {
      switch (result) {
        case '1': {
          result = '⚀';
          break;
        }
        case '2': {
          result = '⚁';
          break;
        }
        case '3': {
          result = '⚂';
          break;
        }
        case '4': {
          result = '⚃';
          break;
        }
        case '5': {
          result = '⚄';
          break;
        }
        case '6': {
          result = '⚅';
          break;
        }
      }
    }

    return result;
  };
}
