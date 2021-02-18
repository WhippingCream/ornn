import {
  Connection,
  DeleteResult,
  EntityTarget,
  InsertResult,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';

import { InternalServerErrorException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class ModelBaseService<T> {
  protected connection: Connection;
  protected entity: EntityTarget<T>;

  constructor(connection: Connection, entity: EntityTarget<T>) {
    this.connection = connection;
    this.entity = entity;
  }

  async getList(): Promise<[T[], number]> {
    const builder = this.createQueryBuilder();
    const result = await builder.getManyAndCount();
    return result;
  }

  async getOne(id: number): Promise<T> {
    const builder = this.createQueryBuilder();
    const result = await builder.where('id = :id', { id }).getOne();
    return result;
  }

  async createOne(
    dto: QueryDeepPartialEntity<T>,
    runner?: QueryRunner,
  ): Promise<InsertResult> {
    const builder = this.createQueryBuilder(runner);
    const result = await builder.insert().values(dto).execute();
    return result;
  }

  async updateOne(
    id: number,
    dto: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const builder = this.createQueryBuilder();
    const result = await builder
      .update()
      .set(dto)
      .where('id = :id', { id })
      .execute();
    return result;
  }

  async removeOne(id: number): Promise<DeleteResult> {
    const builder = this.createQueryBuilder();
    const result = await builder.delete().where('id = :id', { id }).execute();
    return result;
  }

  protected getRepository(runner?: QueryRunner) {
    if (!!runner) {
      if (!runner.isTransactionActive) {
        throw new InternalServerErrorException(
          'QueryRunner is exist, but transaction is not started',
        );
      }
      return runner.manager.getRepository(this.entity);
    }
    return this.connection.getRepository(this.entity);
  }

  public createQueryBuilder(runner?: QueryRunner): SelectQueryBuilder<T> {
    const repository: Repository<T> = this.getRepository(runner);
    return repository.createQueryBuilder();
  }
}
