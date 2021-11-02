import { OrnnError } from '@lib/utils/error';

export class PartyError extends OrnnError {
  constructor(status: number, code: PartyErrorCode) {
    super(
      status,
      'ERR_Party',
      code,
      ErrorMessages.get(code) ||
        'Undefined Party Error, check PartyErrorMessages',
    );
  }

  query?: string;
}

export enum PartyErrorCode {
  PartyNameAlreadyExist = 'PARTY_NAME_ALREADY_EXIST',
  PartyNameIsNotFound = 'PARTY_NAME_IS_NOT_FOUND',
  PartyMemberIsFull = 'PARTY_MEMBER_IS_FULL',
  PartyMemberIsNotFound = 'PARTY_MEMBER_IS_NOT_FOUND',
  PartyMemberAlreadyJoined = 'PARTY_MEMBER_ALREADY_JOINED',
  PartyMemberIndexOutOfRange = 'PARTY_MEMBER_INDEX_OUT_OF_RANGE',
  PartyTypeCannotBeParsed = 'PARTY_TYPE_CANNOT_BE_PARSED',
  FriendlyMatchExitTimeOver = 'FRIENDLY_MATCH_EXIT_TIME_OVER',
}

const ErrorMessages = new Map<PartyErrorCode, string>([
  [PartyErrorCode.PartyNameAlreadyExist, '이미 존재하는 파티명 입니다.'],
  [PartyErrorCode.PartyNameIsNotFound, '파티를 찾을 수 없습니다.'],
  [PartyErrorCode.PartyMemberIsFull, '파티가 가득 찼습니다.'],
  [
    PartyErrorCode.PartyMemberIsNotFound,
    '파티에 해당 참가자를 찾을 수 없습니다.',
  ],
  [PartyErrorCode.PartyMemberAlreadyJoined, '해당 파티에 이미 참가중입니다.'],
  [
    PartyErrorCode.PartyMemberIndexOutOfRange,
    '파티원 번호가 범위를 벗어났습니다.',
  ],
  [
    PartyErrorCode.PartyTypeCannotBeParsed,
    [
      '알 수 없는 파티타입 입니다.',
      '지원하는 파티타입은 다음과 같습니다.',
      '일반, 노말, 솔랭, 듀오, 자랭, 칼바, 칼바람, 내전, 스크림, 외전, 친선, 롤체, tft, 롤토체스, 2-10',
    ].join('\n'),
  ],
  [
    PartyErrorCode.FriendlyMatchExitTimeOver,
    '내전은 시작 30분 전에 탈퇴할 수 없습니다.\n대타 기능을 활용해 주세요.',
  ],
]);
