import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { GroupEntity } from '../group.entity';

import { KakaoUserEntity } from './user.entity';

@Entity({
  name: 'kakao_channels',
})
export class KakaoChannelEntity extends ModelBaseEntity {
  // bigint는 string 써야함
  @Column({ type: 'bigint', unique: true })
  kakaoId: string;

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
  coverUrl: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastSynchronizedAt?: Date;

  @OneToMany(() => KakaoUserEntity, (user) => user.channel, {
    createForeignKeyConstraints: false,
  })
  users?: KakaoUserEntity[];

  @OneToOne(() => GroupEntity, (group) => group.kakaoChannel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;

  groupId: number;
}
