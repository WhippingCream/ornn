import { ModelBaseEntity } from '@db/base/base.entity';
import { LENGTH } from '@db/constants/length';
import { Column, Entity, OneToMany } from 'typeorm';
import { RiotMatchParticipantEntity } from './match.participant.entity';

@Entity({
  name: 'riot_matches',
})
export class RiotMatchEntity extends ModelBaseEntity {
  @Column({
    type: 'bigint',
    unique: true,
  })
  gameId: string;

  @Column({
    type: 'integer',
  })
  queueId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  gameType: string;

  @Column({
    type: 'bigint',
    unique: true,
  })
  gameDuration: string;

  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  platformId: string;
  @Column({
    type: 'bigint',
    unique: true,
  })
  gameCreation: string;

  @Column({
    type: 'integer',
  })
  seasonId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  gameVersion: string;

  @Column({
    type: 'integer',
  })
  mapId: number;

  @Column({
    type: 'varchar',
    length: LENGTH.STRING,
  })
  gameMode: string;

  @OneToMany(
    () => RiotMatchParticipantEntity,
    (participant) => participant.match,
  )
  participants: RiotMatchParticipantEntity[];
}
