import { CommonDate, CommonTime } from '@utils/interfaces';
import {
  AsyncCommandResult,
  Chatlog,
  OpenChannelUserPerm,
  TalkChannel,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

export enum COMMAND_ARGUMENT_TYPE {
  BOOLEAN = 'boolean',
  STRING = 'string',
  INTEGER = 'integer',
  NUMBER = 'number',
  DATE = 'date',
  TIME = 'time',
}

interface CommandArgumentOption {
  type: COMMAND_ARGUMENT_TYPE;
  optional: boolean;

  validationErrorMessage?: string;
}

interface KakaoCommandElements {
  command: string;
  aliases: string[];
  helpMessage?: string;
  argOptions?: CommandArgumentOption[];
}

interface KakaoOpenCommandElements extends KakaoCommandElements {
  roles: OpenChannelUserPerm[];
}

export abstract class KakaoCommand {
  constructor(elements: KakaoCommandElements) {
    this.command = elements.command;
    this.aliases = elements.aliases;
    this.helpMessage = elements.helpMessage || '도움말이 없습니다.';
    this.argOptions = elements.argOptions;
  }
  command: string;
  aliases?: string[];
  helpMessage?: string;
  argOptions?: CommandArgumentOption[];

  abstract execute: (
    data: TalkChatData,
    channel: TalkChannel,
    args: (string | number | boolean | CommonTime | CommonDate)[],
  ) => AsyncCommandResult<Chatlog>;
}

export abstract class KakaoOpenCommand extends KakaoCommand {
  constructor(elements: KakaoOpenCommandElements) {
    super(elements);
    this.roles = elements.roles;
  }
  roles: OpenChannelUserPerm[];
  abstract execute: (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: (string | number | boolean | CommonTime | CommonDate)[],
  ) => AsyncCommandResult<Chatlog>;
}
