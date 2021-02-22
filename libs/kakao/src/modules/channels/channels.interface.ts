import { ChannelType } from 'node-kakao';

export interface IKakaoChannel {
  kakaoId: number;
  type: ChannelType;

  name: string;

  roomImageUrl: string;
}
