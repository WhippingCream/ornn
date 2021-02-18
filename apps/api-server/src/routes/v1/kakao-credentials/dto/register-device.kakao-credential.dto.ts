import { StringParameter } from '@utils';

export class RegisterDeviceKakaoCredentialDto {
  @StringParameter({
    required: false,
    description: '카카오 계정 인증번호',
    maxLength: 4,
    minLength: 4,
  })
  passcord: string;
}
