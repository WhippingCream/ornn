import { ModelBaseEntity } from '@db/base/base.entity';
import { LENGTH } from '@db/constants/length';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
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

  @OneToMany(() => RiotSummonerEntity, (summoner) => summoner.user)
  summoners: RiotSummonerEntity[];

  @OneToOne(() => KakaoUserEntity, (kakaoUser) => kakaoUser.user)
  kakaoUser: KakaoUserEntity;
}
