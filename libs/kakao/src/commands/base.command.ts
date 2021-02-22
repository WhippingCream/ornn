import {
  AsyncCommandResult,
  Chatlog,
  OpenChannelUserPerm,
  TalkChannel,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

interface KakaoCommandElements {
  command: string;
  aliases: string[];
  helpMessage?: string;
}

interface KakaoOpenCommandElements extends KakaoCommandElements {
  roles: OpenChannelUserPerm[];
}

export abstract class KakaoCommand {
  constructor(elements: KakaoCommandElements) {
    this.command = elements.command;
    this.aliases = elements.aliases;
    this.helpMessage = elements.helpMessage || '도움말이 없습니다.';
  }
  command: string;
  aliases?: string[];
  helpMessage?: string;

  abstract execute: (
    data: TalkChatData,
    channel: TalkChannel,
    argString: string,
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
    argString: string,
  ) => AsyncCommandResult<Chatlog>;
}
