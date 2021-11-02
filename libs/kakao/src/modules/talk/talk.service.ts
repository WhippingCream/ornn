import { Injectable, Logger } from '@nestjs/common';
import {
  KakaoCommand,
  KakaoOpenCommand,
} from '@lib/kakao/modules/talk/commands/base.command';
import { KakaoCommandError, KakaoCommandErrorCode } from '@lib/kakao/errors';
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
import { PartyCreateCommand } from './commands/party-create.command';
import { PartyExitCommand } from './commands/party-exit.command';
import { PartyJoinCommand } from './commands/party-join.command';
import { PartyKickCommand } from './commands/party-kick.command';
import { PartyListCommand } from './commands/party-list.command';
import { PartyNameCommand } from './commands/party-name.command';
import { PartyTimeCommand } from './commands/party-time.command';
import { PartyTypeCommand } from './commands/party-type.command';
import { RegisterChannelCommand } from './commands/register-channel.command';
import { SyncChannelCommand } from './commands/sync-channel.command';
import { findOpenSender } from '@lib/kakao/utils';

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
    protected readonly getReadersCommand: GetReadersCommand,
    protected readonly registerChannelCommand: RegisterChannelCommand,
    protected readonly syncChannelCommand: SyncChannelCommand,
    protected readonly mentionEntireRoomCommand: MentionEntireRoomCommand,
    protected readonly mentionByStatusCommand: MentionByStatusCommand,
    protected readonly partyListCommand: PartyListCommand,
    protected readonly partyCreateCommand: PartyCreateCommand,
    protected readonly partyJoinCommand: PartyJoinCommand,
    protected readonly partyExitCommand: PartyExitCommand,
    protected readonly partyKickCommand: PartyKickCommand,
    protected readonly partyNameCommand: PartyNameCommand,
    protected readonly partyTimeCommand: PartyTimeCommand,
    protected readonly partyTypeCommand: PartyTypeCommand,
  ) {
    this.client = new TalkClient();
    this.commands = [
      this.diceCommand,
      this.coinFlipCommand,
      this.cacheCommand,
      this.getReadersCommand,
      this.registerChannelCommand,
      this.syncChannelCommand,
      this.mentionEntireRoomCommand,
      this.mentionByStatusCommand,
      this.partyListCommand,
      this.partyCreateCommand,
      this.partyJoinCommand,
      this.partyExitCommand,
      this.partyKickCommand,
      this.partyNameCommand,
      this.partyTimeCommand,
      this.partyTypeCommand,
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
          .match(/[A-Za-z0-9가-힣_\.:/-\?]+|"[^"]+"|'[^']+'/g) || undefined;
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
        const openUserInfo = findOpenSender(_channel, data.chat.sender);

        if (command instanceof KakaoOpenCommand) {
          if (openChannel && !command.roles.includes(openUserInfo.perm)) {
            Logger.debug('not have perm');
            throw new KakaoCommandError(
              403,
              KakaoCommandErrorCode.PermissionDenied,
            );
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
}
