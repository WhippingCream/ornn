import { DiscordGuildsEntity } from './discord/guild.entity';
import { KakaoChannelsEntity } from './kakao/channel.entity';
import { KakaoCredentialsEntity } from './kakao/credential.entity';
import { KakaoUsersEntity } from './kakao/user.entity';
import { LeagueMatchesEntity } from './league/match.entity';
import { LeagueMatchParticipantsEntity } from './league/match.participant.entity';
import { LeagueSummonersEntity } from './league/summoner.entity';
import { OauthCredentialsEntity } from './oauth/credentials.entity';
import { OrnnGroupUserRelationsEntity } from './ornn/group-user-relations.entity';
import { OrnnGroupsEntity } from './ornn/group.entity';
import { OrnnUsersEntity } from './ornn/user.entity';

export const entities = [
  DiscordGuildsEntity,
  KakaoUsersEntity,
  KakaoChannelsEntity,
  KakaoCredentialsEntity,
  LeagueSummonersEntity,
  LeagueMatchesEntity,
  LeagueMatchParticipantsEntity,
  OrnnUsersEntity,
  OrnnGroupsEntity,
  OrnnGroupUserRelationsEntity,
  OauthCredentialsEntity,
];
