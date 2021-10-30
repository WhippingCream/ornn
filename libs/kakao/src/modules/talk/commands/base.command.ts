import { CommonDate, CommonTime } from '@lib/utils/interfaces';
import {
  OpenChannelUserPerm,
  TalkChannel,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

interface KakaoCommandElements {
  command: string;
  aliases: string[];
  helpMessage?: string;
  argOptions?: string[];
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
  argOptions?: string[];

  abstract execute: (
    data: TalkChatData,
    channel: TalkChannel,
    args?: (string | number | boolean | CommonTime | CommonDate)[],
  ) => string | null | Promise<string | null>;
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
    args?: (string | number | boolean | CommonTime | CommonDate)[],
  ) => string | null | Promise<string | null>;
}
