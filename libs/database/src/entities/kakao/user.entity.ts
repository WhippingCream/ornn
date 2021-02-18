import { ModelBaseEntity } from '@db/base/base.entity';
import { LENGTH } from '@db/constants/length';
import { Column, Entity, ManyToOne } from 'typeorm';

import { KakaoChannelEntity } from './channel.entity';

@Entity({
  name: 'kakao_users',
})
export class KakaoUserEntity extends ModelBaseEntity {
  @Column({
    type: 'bigint',
    unique: true,
  })
  kakaoId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  nickName: string;

  @Column({
    type: 'varchar',
    length: LENGTH.URL,
  })
  profileImageUrl: string;

  @ManyToOne(() => KakaoChannelEntity, (channel) => channel.users)
  channel: KakaoChannelEntity;
}
