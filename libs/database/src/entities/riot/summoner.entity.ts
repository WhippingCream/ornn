import { ModelBaseEntity } from '@db/base/base.entity';
import { LENGTH } from '@db/constants/length';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../user.entity';
import { RiotMatchParticipantEntity } from './match.participant.entity';

@Entity({
  name: 'riot_summoners',
})
export class RiotSummonerEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
    unique: true,
    length: LENGTH.STRING,
  })
  riotEncryptedId: string;

  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  accountEncryptedId: string;

  @Column({
    type: 'integer',
  })
  profileIconId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  EncryptedPuuid: string;

  @Column({
    type: 'bigint',
  })
  level: string;

  @ManyToOne(() => UserEntity, (user) => user.summoners)
  user: UserEntity[];

  @OneToMany(
    () => RiotMatchParticipantEntity,
    (participant) => participant.summoner,
  )
  participants: RiotMatchParticipantEntity[];
}
