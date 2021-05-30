import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { OrnnGroupsEntity } from '../ornn/group.entity';

import { KakaoUsersEntity } from './user.entity';

@Entity({
  name: 'KakaoChannels',
})
export class KakaoChannelsEntity extends ModelBaseEntity {
  @Column({ type: 'bigint', unique: true })
  kakaoId: bigint;

  @Column({
    type: 'varchar',
  })
  type: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  coverUrl: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastSynchronizedAt?: Date;

  @OneToMany(() => KakaoUsersEntity, (user) => user.channel, {
    createForeignKeyConstraints: false,
  })
  users?: KakaoUsersEntity[];

  @OneToOne(() => OrnnGroupsEntity, (group) => group.kakaoChannel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ornnGroupId' })
  ornnGroup: OrnnGroupsEntity;

  @Column({
    name: 'ornnGroupId',
  })
  ornnGroupId: number;
}
