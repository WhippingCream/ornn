import { ModelBaseService } from '@lib/db/base/base.service';
import { CONNECTION } from '@lib/db/constants/connection';
import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class OrnnUsersService extends ModelBaseService<OrnnUsersEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, OrnnUsersEntity);
  }
}
