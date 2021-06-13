import { OauthProvider } from '@lib/utils/enumerations';

export interface OauthCredential {
  provider: OauthProvider;
  memberId: string;
}

export interface KakaoUser {
  id: string;
  nickname?: string;
  profileImage?: string;
}
