import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { LeagueMatchesEntity } from './match.entity';
import { LeagueSummonersEntity } from './summoner.entity';

@Entity({
  name: 'LeagueMatchParticipants',
})
export class LeagueMatchParticipantsEntity extends ModelBaseEntity {
  @Column({
    type: 'integer',
    unique: true,
  })
  participantId: number;

  @ManyToOne(() => LeagueMatchesEntity, (match) => match.participants)
  match: LeagueMatchesEntity;

  @ManyToOne(() => LeagueSummonersEntity, (summoner) => summoner.participants)
  summoner: LeagueSummonersEntity;
}
