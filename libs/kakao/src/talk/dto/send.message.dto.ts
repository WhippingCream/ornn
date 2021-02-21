import { StringParameter } from '@utils';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SendMessageTokenDto {
  @StringParameter({
    required: true,
    description: "토큰 타입 'text' | 'mention'",
  })
  type: 'text' | 'mention';

  @StringParameter({
    required: true,
    description: '타입 별 내용 (text -> 메시지, mention -> 유저 아이디)',
  })
  content: string;
}

export class SendMessageDto {
  @StringParameter({
    required: true,
    description: '채널 아이디',
  })
  channelId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendMessageTokenDto)
  tokens: SendMessageTokenDto[];
}
