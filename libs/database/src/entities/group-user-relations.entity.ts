import { ModelBaseEntity } from '@db/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
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

  @ManyToOne(() => UserEntity, (user) => user.groupRelations)
  user: UserEntity;

  @ManyToOne(() => GroupEntity, (group) => group.userRelations)
  group: GroupEntity;
}
