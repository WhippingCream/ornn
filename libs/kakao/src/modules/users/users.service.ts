import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
import { ModelBaseService } from '@lib/db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@lib/db/constants/connection';

@Injectable()
export class KakaoUserService extends ModelBaseService<KakaoUsersEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoUsersEntity);
  }
}
