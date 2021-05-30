import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LeagueMatchParticipantsEntity } from './match.participant.entity';

@Entity({
  name: 'LeagueMatches',
})
export class LeagueMatchesEntity extends ModelBaseEntity {
  @Column({
    type: 'bigint',
    unique: true,
  })
  gameId: bigint;

  @Column({
    type: 'integer',
  })
  queueId: number;

  @Column({
    type: 'varchar',
  })
  gameType: string;

  @Column({
    type: 'bigint',
    unique: true,
  })
  gameDuration: bigint;

  @Column({
    type: 'varchar',
  })
  platformId: string;
  @Column({
    type: 'bigint',
    unique: true,
  })
  gameCreation: bigint;

  @Column({
    type: 'integer',
  })
  seasonId: number;

  @Column({
    type: 'varchar',
  })
  gameVersion: string;

  @Column({
    type: 'integer',
  })
  mapId: number;

  @Column({
    type: 'varchar',
  })
  gameMode: string;

  @OneToMany(
    () => LeagueMatchParticipantsEntity,
    (participant) => participant.match,
  )
  participants: LeagueMatchParticipantsEntity[];
}
