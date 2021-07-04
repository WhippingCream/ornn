import { HttpService, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { OauthCredentialsService } from './oauth-credentials.service';

interface GetKakaoUserResponse {
  id: bigint;
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

  async validateKakaoUser(kakaoUserId: string): Promise<string | undefined> {
    let userId: string | undefined = undefined;

    try {
      const { data } = await this.httpService
        .get<GetKakaoUserResponse>('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `KakaoAK ${this.configService.get(
              'AUTHORIZATION_KAKAO_ADMIN_KEY',
            )}`,
          },
          params: {
            target_id_type: 'user_id',
            target_id: kakaoUserId,
          },
        })
        .toPromise();

      userId = `${data.id}`;
    } catch (e) {}

    return userId;
  }

  async unlinkKakaoUser(kakaoUserId: string): Promise<string | undefined> {
    let userId: string | undefined = undefined;

    try {
      const { data } = await this.httpService
        .get<GetKakaoUserResponse>('https://kapi.kakao.com/v1/user/unlink', {
          headers: {
            Authorization: `KakaoAK ${this.configService.get(
              'AUTHORIZATION_KAKAO_ADMIN_KEY',
            )}`,
          },
          params: {
            target_id_type: 'user_id',
            target_id: kakaoUserId,
          },
        })
        .toPromise();

      userId = `${data.id}`;
    } catch (e) {}

    return userId;
  }
}
