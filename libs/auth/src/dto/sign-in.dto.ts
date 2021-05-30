import { EnumParameter, IntegerParameter } from '@lib/utils';
import { OauthProvider } from '@lib/utils/enumerations';
import { OauthCredential } from '../types';

export class SignInDto implements OauthCredential {
  @EnumParameter(OauthProvider, {
    required: true,
    description: 'oauth 제공자',
  })
  provider: OauthProvider;

  @IntegerParameter({
    required: true,
    description: 'oauth 유저 ID',
  })
  memberId: bigint;
}
