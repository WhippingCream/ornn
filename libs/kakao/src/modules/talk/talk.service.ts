import { kakaoCommands } from '@kakao/commands';
import { KakaoCommand, KakaoOpenCommand } from '@kakao/commands/base.command';
import { Injectable, Logger } from '@nestjs/common';
import {
  ChatBuilder,
  KnownChatType,
  OpenChannelUserInfo,
  ReplyContent,
  TalkChannel,
  TalkChatData,
  TalkClient,
  TalkOpenChannel,
} from 'node-kakao';

interface ParsedCommand {
  commandMeta?: KakaoCommand;
  argString?: string;
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
      console.log(command.command, command.aliases);
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
    let command: string,
      argString: string,
      openUserInfo: OpenChannelUserInfo,
      openChannel: TalkOpenChannel;

    if (spacePosition === -1) {
      command = data.text.substr(1);
    } else {
      command = data.text.substr(1, spacePosition - 1);
      argString = data.text.substr(data.text.indexOf(' ') + 1);
    }

    const commandMeta = this.commandMap.get(command);

    if (!commandMeta) {
      Logger.debug(`no command(${command})`);
      return {};
    }

    if (channel.info.type === 'OM') {
      const _channel = this.client.channelList.get(channel.channelId);
      if (_channel instanceof TalkOpenChannel) {
        openChannel = _channel;
        openUserInfo = _channel.getUserInfo(data.chat.sender);
      }
    }

    if (commandMeta instanceof KakaoOpenCommand) {
      if (!openChannel) {
        Logger.debug('not openChannel');
        return {};
      }

      if (openChannel && !commandMeta.roles.includes(openUserInfo.perm)) {
        Logger.debug('not have perm');
        return {};
      }
    }

    return {
      commandMeta,
      argString,
      openUserInfo,
      openChannel,
    };
  }

  runCommand(data: TalkChatData, channel: TalkChannel) {
    const { commandMeta, argString } = this.parseCommand(data, channel);
    if (!commandMeta) {
      return;
    }
    return commandMeta.execute(data, channel, argString);
  }

  showCommandHelp(data: TalkChatData, channel: TalkChannel) {
    const { commandMeta } = this.parseCommand(data, channel);

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(commandMeta ? commandMeta.helpMessage : '없는 명령어 입니다.')
        .build(KnownChatType.REPLY),
    );
  }
}
