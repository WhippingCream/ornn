import { ChannelType } from 'node-kakao';

export interface IKakaoChannel {
  kakaoId: bigint;
  type: ChannelType;

  name: string;

  roomImageUrl: string;
}
