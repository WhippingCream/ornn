import { OauthProvider } from '@lib/utils/enumerations';

export interface OauthCredential {
  provider: OauthProvider;
  memberId: bigint;
}
