import { ModelBaseEntity } from '@db/base/base.entity';
import { LENGTH } from '@db/constants/length';
import { Column, Entity, OneToMany } from 'typeorm';

import { KakaoUserEntity } from './user.entity';

@Entity({
  name: 'kakao_channels',
})
export class KakaoChannelEntity extends ModelBaseEntity {
  @Column({ type: 'bigint', unique: true })
  kakaoId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  type: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: LENGTH.URL,
  })
  roomImageUrl: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  clientName: string;

  @Column({
    type: 'varchar',
    length: LENGTH.URL,
  })
  clientRoomImageUrl: string;

  @OneToMany(() => KakaoUserEntity, (user) => user.channel)
  users?: KakaoUserEntity[];
}
