import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'KakaoCredentials',
})
export class KakaoCredentialsEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
  })
  deviceId: string;

  @Column({
    type: 'varchar',
  })
  clientName: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password?: string;
}
