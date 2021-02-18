import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoChannelEntity } from '@db/entities/kakaoTalk/channel.entity';
import { ModelBaseService } from '@db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@db/constants/connection';

@Injectable()
export class KakaoChannelService extends ModelBaseService<KakaoChannelEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoChannelEntity);
  }
}
