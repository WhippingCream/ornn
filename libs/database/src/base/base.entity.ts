import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class ModelBaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: number;
}
