import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import { ModelBaseService } from '@lib/db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@lib/db/constants/connection';

@Injectable()
export class KakaoChannelService extends ModelBaseService<KakaoChannelsEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoChannelsEntity);
  }
}
