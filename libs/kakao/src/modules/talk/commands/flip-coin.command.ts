import { Injectable } from '@nestjs/common';
import { KakaoCommand } from './base.command';

@Injectable()
export class CoinFlipCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'flip-coin',
      aliases: ['동전던지기', '동전'],
      helpMessage: [
        '/동전',
        ' - 동전 뒤집기 입니다.',
        ' - 반반의 확률로 앞면/뒷면이 나옵니다.',
      ].join('\n'),
    });
  }

  execute = () => (Math.round(Math.random()) ? '앞면' : '뒷면');
}
