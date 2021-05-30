import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrnnGroupsEntity } from './group.entity';
import { OrnnUsersEntity } from './user.entity';

@Entity({
  name: 'OrnnGroupUserRelations',
})
export class OrnnGroupUserRelationsEntity extends ModelBaseEntity {
  @Column({
    type: 'integer',
  })
  win: number;

  @Column({
    type: 'integer',
  })
  lose: number;

  @Column({
    type: 'integer',
  })
  baseRating: number;

  @Column({
    type: 'integer',
  })
  additionalRating: number;

  @ManyToOne(() => OrnnUsersEntity, (user) => user.groupRelations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: OrnnUsersEntity;

  @ManyToOne(() => OrnnGroupsEntity, (group) => group.userRelations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'groupId' })
  group: OrnnGroupsEntity;

  @Column({
    name: 'userId',
  })
  userId: number;

  @Column({
    name: 'groupId',
  })
  groupId: number;
}
