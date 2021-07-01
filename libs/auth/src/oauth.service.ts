import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OauthError, OauthErrorCode } from './auth.errors';
import { OauthCredentialsService } from './oauth-credentials.service';
import { KakaoUser } from './types';

interface GetKakaoUserResponse {
  id: string;
  kakao_account?: {
    profile?: {
      nickname: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
  };
}

@Injectable()
export class OauthService {
  constructor(
    protected httpService: HttpService,
    protected configService: ConfigService,
    protected oauthCredentialsService: OauthCredentialsService,
  ) {}

  async getKakaoUserInfoByAdminKey(kakaoUserId: string): Promise<KakaoUser> {
    const { data } = await this.httpService
      .get<GetKakaoUserResponse>('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${this.configService.get(
            'AUTHORIZATION_KAKAO_ADMIN_KEY',
          )}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        params: {
          target_id_type: 'user_id',
          target_id: kakaoUserId,
        },
      })
      .toPromise();

    if (!data) throw new OauthError(500, OauthErrorCode.KakaoGetMeByAdminKey);

    return {
      id: data.id,
      nickname: data.kakao_account?.profile?.nickname,
      profileImage: data.kakao_account?.profile?.profile_image_url,
    };
  }

  async getKakaoUserInfoByAccessToken(accessToken: string): Promise<KakaoUser> {
    const { data } = await this.httpService
      .get<GetKakaoUserResponse>('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .toPromise();

    if (!data)
      throw new OauthError(500, OauthErrorCode.KakaoGetMeByAccessToken);

    return {
      id: data.id,
      nickname: data.kakao_account?.profile?.nickname,
      profileImage: data.kakao_account?.profile?.profile_image_url,
    };
  }
}
