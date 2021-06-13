import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { OauthProvider } from '@lib/utils/enumerations';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { OrnnUsersEntity } from '../ornn/user.entity';

@Entity({
  name: 'OauthCredentials',
})
@Unique('idx_oauth', ['provider', 'memberId'])
export class OauthCredentialsEntity extends ModelBaseEntity {
  @Column({
    type: 'enum',
    enum: OauthProvider,
  })
  provider: OauthProvider;

  @Column({
    type: 'varchar',
  })
  memberId: string;

  @ManyToOne(() => OrnnUsersEntity, (ornnUser) => ornnUser.oauthCredentials, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'ornnUserId',
  })
  ornnUser: OrnnUsersEntity;

  @Column({
    name: 'ornnUserId',
  })
  ornnUserId: number;
}
