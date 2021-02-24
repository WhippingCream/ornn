import { StringParameter } from '@lib/utils';

export class KakaoRegisterDeviceDto {
  @StringParameter({
    required: false,
    description: '카카오 계정 인증번호',
    maxLength: 4,
    minLength: 4,
  })
  passcord: string;
}
