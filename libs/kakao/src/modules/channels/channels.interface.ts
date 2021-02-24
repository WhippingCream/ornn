import { ChannelType } from 'node-kakao';

export interface IKakaoChannel {
  kakaoId: string;
  type: ChannelType;

  name: string;

  roomImageUrl: string;
}
