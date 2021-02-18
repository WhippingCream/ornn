import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoUserEntity } from '@db/entities/kakaoTalk/user.entity';
import { ModelBaseService } from '@db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@db/constants/connection';

@Injectable()
export class KakaoUserService extends ModelBaseService<KakaoUserEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoUserEntity);
  }
}
