import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { Column, Entity, OneToMany } from 'typeorm';
import { GroupUserRelationsEntity } from './group-user-relations.entity';
import { KakaoUserEntity } from './kakao/user.entity';
import { RiotSummonerEntity } from './riot/summoner.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  name: string;

  @OneToMany(
    () => GroupUserRelationsEntity,
    (groupRelation) => groupRelation.user,
  )
  groupRelations: GroupUserRelationsEntity[];

  @OneToMany(() => RiotSummonerEntity, (summoner) => summoner.user, {
    createForeignKeyConstraints: false,
  })
  summoners: RiotSummonerEntity[];

  @OneToMany(() => KakaoUserEntity, (kakaoUser) => kakaoUser.user, {
    createForeignKeyConstraints: false,
  })
  kakaoUsers: KakaoUserEntity[];
}
