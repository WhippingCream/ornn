import { StringParameter } from '@lib/utils';
import { ChannelType } from 'node-kakao';

import { IKakaoChannel } from '../channels.interface';

export class UpdateKakaoChannelDto implements Partial<IKakaoChannel> {
  @StringParameter({
    required: false,
    description: '카카오톡 채팅방 아이디',
  })
  kakaoId?: string;

  @StringParameter({
    required: false,
    description:
      '카카오톡 채팅방 종류\n- UNKNOWN: 알 수 없음\n- MultiChat: 그룹 채팅\n- DirectChat: 1:1 채팅\n- PlusChat: 플러스 친구 채팅\n- MemoChat: Self 채팅\n- OM: 오픈톡 그룹 채팅\n- OD: 오픈 프로필 채팅',
  })
  type?: ChannelType;

  @StringParameter({
    required: false,
    description: '카카오톡 채팅방 이름',
  })
  name?: string;

  @StringParameter({
    required: false,
    description: '카카오톡 채팅방 사진 URL',
  })
  roomImageUrl?: string;
}
