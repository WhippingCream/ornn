import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrnnUsersEntity } from '../ornn/user.entity';
import { LeagueMatchParticipantsEntity } from './match.participant.entity';

@Entity({
  name: 'LeagueSummoners',
})
export class LeagueSummonersEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
    unique: true,
  })
  riotEncryptedId: string;

  @Column({
    type: 'varchar',
  })
  accountEncryptedId: string;

  @Column({
    type: 'integer',
  })
  profileIconId: number;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  EncryptedPuuid: string;

  @Column({
    type: 'bigint',
  })
  level: bigint;

  @ManyToOne(() => OrnnUsersEntity, (user) => user.summoners)
  @JoinColumn({
    name: 'ornnUserId',
  })
  ornnUser: OrnnUsersEntity[];

  @Column({
    name: 'ornnUserId',
  })
  ornnUserId: number;

  @OneToMany(
    () => LeagueMatchParticipantsEntity,
    (participant) => participant.summoner,
  )
  participants: LeagueMatchParticipantsEntity[];
}
