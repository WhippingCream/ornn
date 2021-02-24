import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserEntity } from '../user.entity';

import { KakaoChannelEntity } from './channel.entity';

@Entity({
  name: 'kakao_users',
})
export class KakaoUserEntity extends ModelBaseEntity {
  // bigint는 string 써야함
  @Column({
    type: 'bigint',
    unique: true,
  })
  kakaoId: number;

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

  @ManyToOne(() => KakaoChannelEntity, (channel) => channel.users)
  channel: KakaoChannelEntity;

  @OneToOne(() => UserEntity, (user) => user.kakaoUser)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
