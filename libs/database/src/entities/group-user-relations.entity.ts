import { ModelBaseEntity } from '@lib/db/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';

@Entity({
  name: 'group_user_relations',
})
export class GroupUserRelationsEntity extends ModelBaseEntity {
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

  @ManyToOne(() => UserEntity, (user) => user.groupRelations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => GroupEntity, (group) => group.userRelations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;

  userId: number;
  groupId: number;
}
