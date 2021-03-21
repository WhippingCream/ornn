import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { USER_LEVEL, USER_STATUS } from '@lib/db/enum';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { UserEntity } from '../user.entity';

import { KakaoChannelEntity } from './channel.entity';

@Entity({
  name: 'kakao_users',
})
@Unique('idx_channel_user', ['channelId', 'kakaoId'])
export class KakaoUserEntity extends ModelBaseEntity {
  // bigint는 string 써야함
  @Column({
    type: 'bigint',
  })
  kakaoId: string;

  @Column({
    type: 'integer',
  })
  perm: number;

  @Column({
    type: 'integer',
  })
  type: number;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: LENGTH.URL,
  })
  profileImageUrl: string;

  @Column({
    type: 'integer',
  })
  channelId: number;

  @Column({
    type: 'integer',
  })
  activityScore: number;

  @Column({
    type: 'varchar',
  })
  level: USER_LEVEL;

  @Column({
    type: 'varchar',
  })
  status: USER_STATUS;

  @Column({
    type: 'timestamp',
  })
  lastEnteredAt: Date;

  @Column({
    type: 'timestamp',
  })
  lastExitedAt: Date;

  @ManyToOne(() => KakaoChannelEntity, (channel) => channel.users, {
    createForeignKeyConstraints: false,
  })
  channel: KakaoChannelEntity;

  @ManyToOne(() => UserEntity, (user) => user.kakaoUsers, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  userId: number;
}
