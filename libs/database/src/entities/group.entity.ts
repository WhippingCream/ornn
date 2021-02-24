import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { LENGTH } from '@lib/db/constants/length';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DiscordGuildEntity } from './discord/guild.entity';
import { GroupUserRelationsEntity } from './group-user-relations.entity';
import { KakaoChannelEntity } from './kakao/channel.entity';

@Entity({
  name: 'groups',
})
export class GroupEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
    length: LENGTH.SHORT_STRING,
  })
  name: string;

  @Column({
    type: 'timestamp',
  })
  ratingUpdatedAt: Date;

  @OneToOne(() => KakaoChannelEntity, (channel) => channel.group)
  kakaoChannel: KakaoChannelEntity;

  @OneToOne(() => DiscordGuildEntity, (guild) => guild.group)
  discordGuild: DiscordGuildEntity;

  @OneToMany(
    () => GroupUserRelationsEntity,
    (userRelation) => userRelation.group,
  )
  userRelations: GroupUserRelationsEntity[];
}
