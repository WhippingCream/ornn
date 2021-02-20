import { DiscordGuildEntity } from './discord/guild.entity';
import { GroupUserRelationsEntity } from './group-user-relations.entity';
import { GroupEntity } from './group.entity';
import { KakaoChannelEntity } from './kakao/channel.entity';
import { KakaoCredentialEntity } from './kakao/credential.entity';
import { KakaoUserEntity } from './kakao/user.entity';
import { RiotMatchEntity } from './riot/match.entity';
import { RiotMatchParticipantEntity } from './riot/match.participant.entity';
import { RiotSummonerEntity } from './riot/summoner.entity';
import { UserEntity } from './user.entity';

export const entities = [
  KakaoChannelEntity,
  KakaoUserEntity,
  KakaoCredentialEntity,
  DiscordGuildEntity,
  RiotSummonerEntity,
  RiotMatchEntity,
  RiotMatchParticipantEntity,
  GroupEntity,
  UserEntity,
  GroupUserRelationsEntity,
];
