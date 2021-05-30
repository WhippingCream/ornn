import { kakaoCommands } from '@lib/kakao/commands';
import {
  COMMAND_ARGUMENT_TYPE,
  KakaoCommand,
  KakaoOpenCommand,
} from '@lib/kakao/commands/base.command';
import { Injectable, Logger } from '@nestjs/common';
import { converters } from '@lib/utils/converters';
import { CommonDate, CommonTime } from '@lib/utils/interfaces';
import {
  OpenChannelUserInfo,
  TalkChannel,
  TalkChatData,
  TalkClient,
  TalkOpenChannel,
} from 'node-kakao';

interface ParsedCommand {
  isHelp?: boolean;
  command?: KakaoCommand;
  args?: string[];
  openUserInfo?: OpenChannelUserInfo;
  openChannel?: TalkOpenChannel;
}

@Injectable()
export class KakaoTalkService {
  constructor() {
    this.client = new TalkClient();
    this.commands = [
      ...kakaoCommands.map((CommandClass) => new CommandClass()),
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
      args: string[],
      openUserInfo: OpenChannelUserInfo,
      openChannel: TalkOpenChannel;

    if (spacePosition === -1) {
      commandString = data.text.substr(1);
    } else {
      commandString = data.text.substr(1, spacePosition - 1);
      args = data.text
        .substr(data.text.indexOf(' ') + 1)
        .match(/[A-Za-z0-9가-힣_\.:/-]+|"[^"]+"|'[^']+'/g);
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
      }
    }

    if (command instanceof KakaoOpenCommand) {
      if (!openChannel) {
        Logger.debug('not openChannel');
        return {};
      }

      if (openChannel && !command.roles.includes(openUserInfo.perm)) {
        Logger.debug('not have perm');
        throw new Error('권한이 없습니다.');
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
    stringArgs: string[],
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
          args.push(null);
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
