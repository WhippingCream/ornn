import {
  Connection,
  EntityManager,
  EntityTarget,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ModelBaseEntity } from './base.entity';
import { DatabaseError, DatabaseErrorCode } from '../database.errors';

export abstract class ModelBaseService<T extends ModelBaseEntity> {
  protected connection: Connection;
  protected entity: EntityTarget<T>;

  constructor(connection: Connection, entity: EntityTarget<T>) {
    this.connection = connection;
    this.entity = entity;
  }

  getManager(): EntityManager {
    return this.connection.manager;
  }

  async getList(runner?: QueryRunner): Promise<[T[], number]> {
    const qb = this.createQueryBuilder(runner);
    let result: [T[], number];
    try {
      result = await qb.getManyAndCount();
    } catch (err) {
      throw new DatabaseError(DatabaseErrorCode.GetListFailed, qb.getQuery());
    }
    return result;
  }

  async getOne(id: number, runner?: QueryRunner): Promise<T | undefined> {
    const qb = this.createQueryBuilder(runner);
    let result: T | undefined;
    try {
      result = await qb.where('id = :id', { id }).getOne();
    } catch (err) {
      throw new DatabaseError(DatabaseErrorCode.GetOneFailed, qb.getQuery());
    }
    return result;
  }

  async createOne(
    dto: QueryDeepPartialEntity<T>,
    runner?: QueryRunner,
  ): Promise<number | undefined> {
    const qb = this.createQueryBuilder(runner);
    let id: number | undefined;

    try {
      const result = await qb.insert().values(dto).execute();
      if (result.identifiers.length) {
        id = result.identifiers[0].id;
      }
    } catch (e) {
      throw new DatabaseError(DatabaseErrorCode.CreateFailed, qb.getQuery());
    }

    return id;
  }

  async updateOne(
    id: number,
    dto: QueryDeepPartialEntity<T>,
    runner?: QueryRunner,
  ): Promise<number> {
    const qb = this.createQueryBuilder(runner);
    try {
      await qb.update().set(dto).where('id = :id', { id }).execute();
    } catch (err) {
      throw new DatabaseError(DatabaseErrorCode.UpdateFailed, qb.getQuery());
    }

    return id;
  }

  async removeOne(id: number, runner?: QueryRunner): Promise<number> {
    const qb = this.createQueryBuilder(runner);
    try {
      await qb.delete().where('id = :id', { id }).execute();
      return id;
    } catch (err) {
      throw new DatabaseError(DatabaseErrorCode.DeleteFailed, qb.getQuery());
    }
  }

  protected getRepository(runner?: QueryRunner): Repository<T> {
    if (!!runner) {
      if (!runner.isTransactionActive) {
        throw new DatabaseError(DatabaseErrorCode.TransactionIsNotStarted);
      }
      return runner.manager.getRepository(this.entity);
    }
    return this.connection.getRepository(this.entity);
  }

  public createQueryBuilder(runner?: QueryRunner): SelectQueryBuilder<T> {
    const result = this.getRepository(runner);
    return result.createQueryBuilder();
  }

  public createQueryRunner(): QueryRunner {
    return this.connection.createQueryRunner();
  }
}
