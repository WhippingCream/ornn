import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
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

  @ManyToOne(() => KakaoChannelEntity, (channel) => channel.users)
  channel: KakaoChannelEntity;

  @OneToOne(() => UserEntity, (user) => user.kakaoUser)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
