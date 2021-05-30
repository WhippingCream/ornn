import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DiscordGuildsEntity } from '../discord/guild.entity';
import { OrnnGroupUserRelationsEntity } from './group-user-relations.entity';
import { KakaoChannelsEntity } from '../kakao/channel.entity';

@Entity({
  name: 'OrnnGroups',
})
export class OrnnGroupsEntity extends ModelBaseEntity {
  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'timestamp',
  })
  ratingUpdatedAt: Date;

  @OneToOne(() => KakaoChannelsEntity, (channel) => channel.ornnGroup, {
    createForeignKeyConstraints: false,
  })
  kakaoChannel: KakaoChannelsEntity;

  @OneToOne(() => DiscordGuildsEntity, (guild) => guild.ornnGroup, {
    createForeignKeyConstraints: false,
  })
  discordGuild: DiscordGuildsEntity;

  @OneToMany(
    () => OrnnGroupUserRelationsEntity,
    (userRelation) => userRelation.group,
    {
      createForeignKeyConstraints: false,
    },
  )
  userRelations: OrnnGroupUserRelationsEntity[];
}
