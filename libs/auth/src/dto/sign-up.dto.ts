import { DateParameter, EnumParameter, StringParameter } from '@lib/utils';
import { Gender } from '@lib/utils/enumerations';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @StringParameter({
    required: true,
    description: '사용자 명',
  })
  username: string;

  @EnumParameter(Gender, {
    required: true,
    description: '성별',
  })
  gender: Gender;

  @DateParameter({
    required: true,
    description: '성별',
  })
  birth: Date;
}
