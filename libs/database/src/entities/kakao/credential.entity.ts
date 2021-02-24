import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'kakao_credentials',
})
export class KakaoCredentialEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  deviceId: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  clientName: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
    nullable: true,
  })
  email?: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
    nullable: true,
  })
  password?: string;
}
