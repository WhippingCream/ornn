import { IntegerParameter, StringParameter } from '@utils';
import { IKakaoUser } from '../users.interface';

export class CreateKakaoUserDto implements IKakaoUser {
  @IntegerParameter({
    required: true,
    description:
      '카카오톡 채팅방 참여인원 내부아이디 (같은 유저여도 채팅방 마다 다름)',
  })
  kakaoId: number;

  @StringParameter({
    required: true,
    description: '카카오톡 채팅방 참여인원 닉네임',
  })
  nickName: string;

  @StringParameter({
    required: true,
    description: '카카오톡 채팅방 참여인원 프로필 사진 URL',
  })
  profileImageUrl: string;
}
