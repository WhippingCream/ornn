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
  PartyNameNotFound = 'PARTY_NAME_NOT_FOUND',
  PartyMemberIsFull = 'PARTY_MEMBER_IS_FULL',
  PartyQueueTypeParseFailed = 'PARTY_QUEUE_TYPE_PARSE_FAILED',
}

const ErrorMessages = new Map<PartyErrorCode, string>([
  [PartyErrorCode.PartyNameAlreadyExist, '이미 존재하는 파티명 입니다.'],
  [PartyErrorCode.PartyNameNotFound, '파티를 찾을 수 없습니다.'],
  [PartyErrorCode.PartyMemberIsFull, '파티가 가득 찼습니다.'],
]);
