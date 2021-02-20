import { ModelBaseEntity } from '@db/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RiotMatchEntity } from './match.entity';
import { RiotSummonerEntity } from './summoner.entity';

@Entity({
  name: 'riot_match_participants',
})
export class RiotMatchParticipantEntity extends ModelBaseEntity {
  @Column({
    type: 'integer',
    unique: true,
  })
  participantId: number;

  @ManyToOne(() => RiotMatchEntity, (match) => match.participants)
  match: RiotMatchEntity;

  @ManyToOne(() => RiotSummonerEntity, (summoner) => summoner.participants)
  summoner: RiotSummonerEntity;
}
