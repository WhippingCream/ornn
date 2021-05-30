import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Gender } from '@lib/utils/enumerations';
import { Column, Entity, OneToMany } from 'typeorm';
import { OrnnGroupUserRelationsEntity } from './group-user-relations.entity';
import { KakaoUsersEntity } from '../kakao/user.entity';
import { LeagueSummonersEntity } from '../league/summoner.entity';
import { OauthCredentialsEntity } from '../oauth/credentials.entity';

@Entity({
  name: 'OrnnUsers',
})
export class OrnnUsersEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
  })
  username: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  birth?: Date;

  @OneToMany(
    () => OrnnGroupUserRelationsEntity,
    (groupRelation) => groupRelation.user,
  )
  groupRelations: OrnnGroupUserRelationsEntity[];

  @OneToMany(() => LeagueSummonersEntity, (summoner) => summoner.ornnUser, {
    createForeignKeyConstraints: false,
  })
  summoners: LeagueSummonersEntity[];

  @OneToMany(() => KakaoUsersEntity, (kakaoUser) => kakaoUser.ornnUser, {
    createForeignKeyConstraints: false,
  })
  kakaoUsers: KakaoUsersEntity[];

  @OneToMany(
    () => OauthCredentialsEntity,
    (oauthCredential) => oauthCredential.ornnUser,
    {
      createForeignKeyConstraints: false,
    },
  )
  oauthCredentials: OauthCredentialsEntity[];
}
