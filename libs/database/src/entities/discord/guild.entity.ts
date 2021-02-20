import { ModelBaseEntity } from '@db/base/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { GroupEntity } from '../group.entity';

@Entity({
  name: 'discord_guilds',
})
export class DiscordGuildEntity extends ModelBaseEntity {
  // bigint는 string 써야함
  @Column({ type: 'bigint', unique: true })
  discordId: string;

  @OneToOne(() => GroupEntity, (group) => group.discordGuild)
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;
}
