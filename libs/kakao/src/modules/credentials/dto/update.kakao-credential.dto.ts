import { StringParameter } from '@lib/utils';
import { IKakaoCredential } from '../credentials.interface';

export class UpdateKakaoCredentialDto
  implements Partial<Omit<IKakaoCredential, 'deviceId' | 'clientName'>> {
  @StringParameter({
    required: false,
    description: '카카오 계정 이메일',
  })
  email?: string;

  @StringParameter({
    required: false,
    description: '카카오 계정 비밀번호 (평문)',
  })
  password?: string;
}
