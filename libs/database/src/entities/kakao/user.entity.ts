import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { KakaoUserLevel, KakaoUserStatus } from '@lib/utils/enumerations';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { OrnnUsersEntity } from '../ornn/user.entity';

import { KakaoChannelsEntity } from './channel.entity';

@Entity({
  name: 'KakaoUsers',
})
@Unique('idx_channel_user', ['channelId', 'kakaoId'])
export class KakaoUsersEntity extends ModelBaseEntity {
  @Column({
    type: 'bigint',
  })
  kakaoId: bigint;

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
  })
  name: string;

  @Column({
    type: 'varchar',
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
    type: 'enum',
    enum: KakaoUserLevel,
  })
  level: KakaoUserLevel;

  @Column({
    type: 'enum',
    enum: KakaoUserStatus,
  })
  status: KakaoUserStatus;

  @Column({
    type: 'timestamp',
  })
  lastEnteredAt: Date;

  @Column({
    type: 'timestamp',
  })
  lastExitedAt: Date;

  @ManyToOne(() => KakaoChannelsEntity, (channel) => channel.users, {
    createForeignKeyConstraints: false,
  })
  channel: KakaoChannelsEntity;

  @ManyToOne(() => OrnnUsersEntity, (ornnUser) => ornnUser.kakaoUsers, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ornnUserId' })
  ornnUser: OrnnUsersEntity;

  @Column({
    name: 'ornnUserId',
  })
  ornnUserId: number;
}
