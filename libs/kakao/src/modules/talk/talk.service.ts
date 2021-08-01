import {
  COMMAND_ARGUMENT_TYPE,
  KakaoCommand,
  KakaoOpenCommand,
} from '@lib/kakao/modules/talk/commands/base.command';
import { CommonDate, CommonTime } from '@lib/utils/interfaces';
import { Injectable, Logger } from '@nestjs/common';
import {
  OpenChannelUserInfo,
  TalkChannel,
  TalkChatData,
  TalkClient,
  TalkOpenChannel,
} from 'node-kakao';

import { CacheCommand } from './commands/cache-test.command';
import { CoinFlipCommand } from './commands/flip-coin.command';
import { DiceCommand } from './commands/dice.command';
import { GetReadersCommand } from './commands/get-readers.command';
import { MentionByStatusCommand } from './commands/mention-by-status.command';
import { MentionEntireRoomCommand } from './commands/mention-entire-room.command';
import { ParamTestCommand } from './commands/param-test.command';
import { PartyCreateCommand } from './commands/party.command/party-create.command';
import { PartyExitCommand } from './commands/party.command/party-exit.command';
import { PartyJoinCommand } from './commands/party.command/party-join.command';
import { PartyPrintListCommand } from './commands/party.command/party-print-list.command';
import { PartyUpdateTimeCommand } from './commands/party.command/party-update-time.command';
import { RegisterChannelCommand } from './commands/register-channel.command';
import { SyncChannelCommand } from './commands/sync-channel.command';
import { converters } from '@lib/utils/converters';

interface ParsedCommand {
  isHelp?: boolean;
  command?: KakaoCommand;
  args?: string[];
  openUserInfo?: OpenChannelUserInfo;
  openChannel?: TalkOpenChannel;
}

@Injectable()
export class KakaoTalkService {
  constructor(
    protected readonly diceCommand: DiceCommand,
    protected readonly coinFlipCommand: CoinFlipCommand,
    protected readonly cacheCommand: CacheCommand,
    protected readonly paramTestCommand: ParamTestCommand,
    protected readonly getReadersCommand: GetReadersCommand,
    protected readonly registerChannelCommand: RegisterChannelCommand,
    protected readonly syncChannelCommand: SyncChannelCommand,
    protected readonly mentionEntireRoomCommand: MentionEntireRoomCommand,
    protected readonly mentionByStatusCommand: MentionByStatusCommand,
    protected readonly partyCreateCommand: PartyCreateCommand,
    protected readonly partyPrintListCommand: PartyPrintListCommand,
    protected readonly partyJoinCommand: PartyJoinCommand,
    protected readonly partyExitCommand: PartyExitCommand,
    protected readonly partyUpdateTimeCommand: PartyUpdateTimeCommand,
  ) {
    this.client = new TalkClient();
    this.commands = [
      this.diceCommand,
      this.coinFlipCommand,
      this.cacheCommand,
      this.paramTestCommand,
      this.getReadersCommand,
      this.registerChannelCommand,
      this.syncChannelCommand,
      this.mentionEntireRoomCommand,
      this.mentionByStatusCommand,
      this.partyCreateCommand,
      this.partyPrintListCommand,
      this.partyJoinCommand,
      this.partyExitCommand,
      this.partyUpdateTimeCommand,
    ];
    this.commandMap = new Map<string, KakaoCommand>();

    this.commands.forEach((command) => {
      if (this.commandMap.has(command.command)) {
        throw new Error(`Command(${command.command}) is already included!`);
      }
      this.commandMap.set(command.command, command);
      if (command.aliases) {
        command.aliases.forEach((alias) => {
          if (this.commandMap.has(alias)) {
            throw new Error(`Alias(${alias}) is already included!`);
          }
          this.commandMap.set(alias, command);
        });
      }
    });

    for (const [key] of this.commandMap) {
      Logger.debug(key);
    }
  }
  client: TalkClient;

  commands: KakaoCommand[];
  commandMap: Map<string, KakaoCommand>;

  parseCommand(data: TalkChatData, channel: TalkChannel): ParsedCommand {
    const spacePosition = data.text.indexOf(' ');
    let isHelp = false,
      commandString: string,
      args: string[] | undefined,
      openUserInfo: OpenChannelUserInfo | undefined,
      openChannel: TalkOpenChannel | undefined;

    if (spacePosition === -1) {
      commandString = data.text.substr(1);
    } else {
      commandString = data.text.substr(1, spacePosition - 1);
      args =
        data.text
          .substr(data.text.indexOf(' ') + 1)
          .match(/[A-Za-z0-9가-힣_\.:/-]+|"[^"]+"|'[^']+'/g) || undefined;
    }

    if (commandString.charAt(commandString.length - 1) === '?') {
      isHelp = true;
    }

    const command = this.commandMap.get(
      isHelp
        ? commandString.substring(0, commandString.length - 1)
        : commandString,
    );

    if (!command) {
      Logger.debug(`no command(${commandString})`);
      return {};
    }

    if (channel.info.type === 'OM') {
      const _channel = this.client.channelList.get(channel.channelId);
      if (_channel instanceof TalkOpenChannel) {
        openChannel = _channel;
        openUserInfo = _channel.getUserInfo(data.chat.sender);

        if (!openUserInfo) {
          throw new Error('오픈채널 유저 정보를 가져올 수 없습니다.');
        }

        if (command instanceof KakaoOpenCommand) {
          if (openChannel && !command.roles.includes(openUserInfo.perm)) {
            Logger.debug('not have perm');
            throw new Error('권한이 없습니다.');
          }
        }
      }
    }

    return {
      isHelp,
      command,
      args,
      openUserInfo,
      openChannel,
    };
  }

  validateCommandArguments(
    command: KakaoCommand,
    stringArgs: string[] | undefined,
  ): (string | number | boolean | CommonTime | CommonDate)[] {
    const args: (string | number | boolean | CommonTime | CommonDate)[] = [];

    command.argOptions?.forEach(
      ({ type, optional, validationErrorMessage: vem }, index) => {
        // const isExistArgs = stringArgs && stringArgs[index];
        // if (!isExistArgs) {
        //   if (optional) {
        //     args.push(null);
        //     return;
        //   } else {
        //     throw new Error(`${index + 1}번째 인자는 필수입니다.`);
        //   }
        // }
        if (!(stringArgs && stringArgs[index])) {
          if (!optional) {
            throw new Error(vem || `${index + 1}번째 인자는 필수입니다.`);
          }
          args.push('');
          return;
        }

        // withoutQuotes
        const stringArg = stringArgs[index].replace(/['"]+/g, '');

        switch (type) {
          case COMMAND_ARGUMENT_TYPE.STRING: {
            args.push(stringArg);
            break;
          }
          case COMMAND_ARGUMENT_TYPE.INTEGER: {
            const result = converters.str2int(stringArg);
            if (result === null) {
              throw new Error(vem || `${stringArg} 는 정수 값이 아닙니다.`);
            }
            args.push(result);
            break;
          }
          case COMMAND_ARGUMENT_TYPE.NUMBER: {
            const result = converters.str2num(stringArg);
            if (result === null) {
              throw new Error(vem || `${stringArg} 는 숫자 값이 아닙니다.`);
            }
            args.push(result);
            break;
          }
          case COMMAND_ARGUMENT_TYPE.BOOLEAN: {
            const result = converters.str2bool(stringArg);
            if (result === null) {
              throw new Error(vem || `${stringArg} 는 논리 값이 아닙니다.`);
            }
            args.push(result);
            break;
          }
          case COMMAND_ARGUMENT_TYPE.DATE: {
            const result = converters.str2date(stringArg);
            if (result === null) {
              throw new Error(
                vem || `${stringArg} 는 날짜(월/일) 값이 아닙니다.`,
              );
            }
            args.push(result);
            break;
          }
          case COMMAND_ARGUMENT_TYPE.TIME: {
            const result = converters.str2time(stringArg);
            if (result === null) {
              throw new Error(
                vem || `${stringArg} 는 시간(시:분) 값이 아닙니다.`,
              );
            }
            args.push(result);
            break;
          }
        }
      },
    );

    return args;
  }
}
