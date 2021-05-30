import { IntegerParameter, StringParameter } from '@lib/utils';
import { IKakaoUser } from '../users.interface';

export class UpdateKakaoUserDto implements Partial<IKakaoUser> {
  @IntegerParameter({
    required: false,
    description:
      '카카오톡 채팅방 참여인원 내부아이디 (같은 유저여도 채팅방 마다 다름)',
  })
  kakaoId?: bigint;

  @IntegerParameter({
    required: false,
    description: '오픈톡 유저 권한',
  })
  perm?: number;

  @IntegerParameter({
    required: false,
    description: '오픈톡 유저 타입',
  })
  type?: number;

  @StringParameter({
    required: false,
    description: '카카오톡 채팅방 참여인원 닉네임',
  })
  nickName?: string;

  @StringParameter({
    required: false,
    description: '카카오톡 채팅방 참여인원 프로필 사진 URL',
  })
  profileImageUrl?: string;
}
