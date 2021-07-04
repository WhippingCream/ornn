import { DateParameter, EnumParameter, StringParameter } from '@lib/utils';
import { Gender } from '@lib/utils/enumerations';

import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @EnumParameter(Gender, {
    required: true,
    description: '성별',
  })
  gender: Gender;

  @StringParameter({
    required: true,
    description: '별명',
  })
  username: string;

  @DateParameter({
    required: true,
    description: '성별',
  })
  birth: Date;
}
