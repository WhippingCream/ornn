import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OrnnGroupsEntity } from '../ornn/group.entity';

@Entity({
  name: 'DiscordGuilds',
})
export class DiscordGuildsEntity extends ModelBaseEntity {
  @Column({ type: 'bigint', unique: true })
  discordId: bigint;

  @OneToOne(() => OrnnGroupsEntity, (group) => group.discordGuild, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ornnGroupId' })
  ornnGroup: OrnnGroupsEntity;

  @Column({
    name: 'ornnGroupId',
  })
  ornnGroupId: number;
}
