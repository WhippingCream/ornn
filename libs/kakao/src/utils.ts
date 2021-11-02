import {
  ChannelUser,
  ChatBuilder,
  Chatlog,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkOpenChannel,
} from 'node-kakao';
import { CommonDate, CommonTime } from '@lib/utils/interfaces';
import { KakaoCommandError, KakaoCommandErrorCode } from './errors';

export const findSender = (channel: TalkChannel, sender: ChannelUser) => {
  const result = channel.getUserInfo(sender);
  if (!result) {
    throw new KakaoCommandError(
      500,
      KakaoCommandErrorCode.CannotFindUserFromChannel,
    );
  }
  return result;
};

export const findOpenSender = (
  channel: TalkOpenChannel,
  sender: ChannelUser,
) => {
  const result = channel.getUserInfo(sender);
  if (!result) {
    throw new KakaoCommandError(
      500,
      KakaoCommandErrorCode.CannotFindUserFromChannel,
    );
  }
  return result;
};

export const replyText = (
  channel: TalkChannel,
  origin: Readonly<Chatlog>,
  message: string,
) =>
  channel.sendChat(
    new ChatBuilder()
      .append(new ReplyContent(origin))
      .text(message)
      .build(KnownChatType.REPLY),
  );

const str2boolConverter = (src: string): boolean => {
  const stringBool = src.replace(/['"]+/g, '');

  if (stringBool === 'true' || stringBool === 't' || stringBool === '참') {
    return true;
  }

  if (stringBool === 'false' || stringBool === 'f' || stringBool === '거짓') {
    return false;
  }

  throw new KakaoCommandError(
    400,
    KakaoCommandErrorCode.ConvertToBooleanFailed,
  );
};

const str2intConverter = (src: string): number => {
  const result = parseInt(src, 10);

  if (isNaN(result)) {
    throw new KakaoCommandError(
      400,
      KakaoCommandErrorCode.ConvertToIntegerFailed,
    );
  }

  return result;
};

const str2numConverter = (src: string): number => {
  const result = Number(src);

  if (isNaN(result)) {
    throw new KakaoCommandError(
      400,
      KakaoCommandErrorCode.ConvertToNumberFailed,
    );
  }

  return result;
};

const str2timeConverter = (src: string): CommonTime => {
  if (src.indexOf(':') === -1 && /^([01]\d|2[0-3])[0-5]\d$/.test(src)) {
    const hour = src.slice(0, 2);
    const minute = src.slice(2, 4);
    return { hour: parseInt(hour, 10), minute: parseInt(minute, 10) };
  }

  // HH:mm
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(src)) {
    const [hour, minute] = src.split(':');
    return { hour: parseInt(hour, 10), minute: parseInt(minute, 10) };
  }

  // HH:mm:dd
  if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(src)) {
    const [hour, minute, second] = src.split(':');
    return {
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      second: parseInt(second, 10),
    };
  }

  throw new KakaoCommandError(400, KakaoCommandErrorCode.ConvertToTimeFailed);
};

const str2dateConverter = (src: string): CommonDate => {
  // MM/dd | MM.dd => MM-dd
  const _src = src.replace(/[/\.]+/g, '-');

  // MM-dd
  if (/^(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(_src)) {
    const [month, day] = src.split(':');
    return { month: parseInt(month, 10), day: parseInt(day, 10) };
  }

  throw new KakaoCommandError(400, KakaoCommandErrorCode.ConvertToDateFailed);
};

export const converters = {
  str2bool: str2boolConverter,
  str2int: str2intConverter,
  str2num: str2numConverter,
  str2time: str2timeConverter,
  str2date: str2dateConverter,
};
