import { OrnnError } from '@lib/utils/error';

export class AuthError extends OrnnError {
  constructor(status: number, code: AuthErrorCode) {
    super(
      status,
      'ERR_AUTH',
      code,
      AuthErrorMessages.get(code) ||
        'Undefined Auth Error, check AuthErrorMessages',
    );
  }

  query?: string;
}

export enum AuthErrorCode {
  UserCreationFailed = 'USER_CREATION_FAILED',
  CredentialRegistrationFailed = 'CREDENTIAL_REGISTRATION_FAILED',
  NotRegistered = 'NOT_REGISTERED',
}

const AuthErrorMessages = new Map<AuthErrorCode, string>([
  [AuthErrorCode.UserCreationFailed, '사용자 생성에 실패했습니다.'],
  [
    AuthErrorCode.CredentialRegistrationFailed,
    '인증 정보 등록에 실패했습니다.',
  ],
]);

export class OauthError extends OrnnError {
  constructor(status: number, code: OauthErrorCode) {
    super(
      status,
      'ERR_OAUTH',
      code,
      OauthErrorMessages.get(code) ||
        'Undefined Oauth Error, check OauthErrorMessages',
    );
  }

  query?: string;
}

export enum OauthErrorCode {
  ExistedCredential = 'EXISTED_CREDENTIAL',
  UnsupportedProvider = 'UNSUPPORTED_PROVIDER',
  CannotFindCredential = 'CANNOT_FIND_CREDENTIAL',
  KakaoGetMeByAdminKey = 'KAKAO/GET_ME_BY_ADMIN_KEY',
  KakaoGetMeByAccessToken = 'KAKAO/GET_ME_BY_ACCESS_TOKEN',
}

const OauthErrorMessages = new Map<OauthErrorCode, string>([
  [OauthErrorCode.ExistedCredential, '이미 가입한 oauth 정보 입니다.'],
  [OauthErrorCode.UnsupportedProvider, '지원하지 않는 oauth 제공자 입니다.'],
  [
    OauthErrorCode.CannotFindCredential,
    'oauth 로그인 정보를 찾을 수 없습니다.',
  ],
  [
    OauthErrorCode.KakaoGetMeByAdminKey,
    '[카카오 API] 어드민 키를 이용한 사용자 정보를 가져오는데 실패하였습니다.',
  ],
  [
    OauthErrorCode.KakaoGetMeByAccessToken,
    '[카카오 API] 액세스 토큰을 이용한 사용자 정보를 가져오는데 실패하였습니다.',
  ],
]);
