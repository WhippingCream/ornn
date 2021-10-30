import { OrnnError } from '@lib/utils/error';

export class KakaoCommandError extends OrnnError {
  constructor(status: number, code: KakaoCommandErrorCode) {
    super(
      status,
      'ERR_KakaoCommand',
      code,
      KakaoCommandErrorMessages.get(code) ||
        'Undefined message, check KakaoCommandErrorMessages',
    );
  }

  query?: string;
}

export enum KakaoCommandErrorCode {
  ConvertToBooleanFailed = 'CONVERT_TO_BOOLEAN_FAILED',
  ConvertToIntegerFailed = 'CONVERT_TO_INTEGER_FAILED',
  ConvertToNumberFailed = 'CONVERT_TO_NUMBER_FAILED',
  ConvertToDateFailed = 'CONVERT_TO_DATE_FAILED',
  ConvertToTimeFailed = 'CONVERT_TO_TIME_FAILED',
  PermissionDenied = 'PERMISSION_DENIED',
  CannotFindUserFromChannel = 'CANNOT_FIND_USER_FROM_CHANNEL',
}

const KakaoCommandErrorMessages = new Map<KakaoCommandErrorCode, string>([
  [
    KakaoCommandErrorCode.ConvertToBooleanFailed,
    '입력 파라미터의 부울 변환에 실패하였습니다.',
  ],
  [
    KakaoCommandErrorCode.ConvertToIntegerFailed,
    '입력 파라미터의 정수 변환에 실패하였습니다.',
  ],
  [
    KakaoCommandErrorCode.ConvertToNumberFailed,
    '입력 파라미터의 숫자 변환에 실패하였습니다.',
  ],
  [
    KakaoCommandErrorCode.ConvertToDateFailed,
    '입력 파라미터의 날짜 변환에 실패하였습니다.',
  ],
  [
    KakaoCommandErrorCode.ConvertToTimeFailed,
    '입력 파라미터의 시간 변환에 실패하였습니다.',
  ],
  [KakaoCommandErrorCode.PermissionDenied, '실행 권한이 없습니다.'],
  [
    KakaoCommandErrorCode.CannotFindUserFromChannel,
    '채널에서 사용자를 찾을 수 없습니다.',
  ],
]);
