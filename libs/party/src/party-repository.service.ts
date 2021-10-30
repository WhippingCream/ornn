import { Party, PartyQueueType } from './party.type';
import { PartyError, PartyErrorCode } from './party.errors';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class PartyRepositoryService {
  client: Redis;
  constructor(private readonly redisService: RedisService) {
    this.client = this.redisService.getClient();
  }

  async getAll(channel: string) {
    //
    // 만료 파티 삭제 코드 필요
    //
    const partyListData = await this.client.hgetall(channel);

    const partyList = Object.entries(partyListData).map(([name, data]) =>
      Party.deserialize(name, data),
    );

    for (const party of partyList) {
      const diffNowMillis = DateTime.fromISO(party.startedAt)
        .diffNow()
        .valueOf();

      // 1시간 경과된 파티 삭제
      if (diffNowMillis < -3600000) {
        this.client.hdel(channel, party.name);
      }
    }

    partyList.sort((a, b) =>
      DateTime.fromISO(a.startedAt)
        .diff(DateTime.fromISO(b.startedAt))
        .toMillis(),
    );

    return partyList;
  }

  async getOne(channel: string, name: string) {
    const data = await this.client.hget(channel, name);

    if (!data) {
      throw new PartyError(404, PartyErrorCode.PartyNameIsNotFound);
    }

    return Party.deserialize(name, data);
  }

  async create(
    channel: string,
    name: string,
    type: PartyQueueType,
    startedAt: DateTime,
  ) {
    const originData = await this.client.hget(channel, name);

    if (originData) {
      throw new PartyError(400, PartyErrorCode.PartyNameAlreadyExist);
    }

    const party = new Party(name, type, startedAt);

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }

  async update(channel: string, name: string, party: Party) {
    const origin = await this.getOne(channel, name);

    if (!origin) {
      throw new PartyError(400, PartyErrorCode.PartyNameIsNotFound);
    }

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }

  async updateName(channel: string, name: string, newName: string) {
    const party = await this.getOne(channel, name);

    if (!party) {
      throw new PartyError(400, PartyErrorCode.PartyNameIsNotFound);
    }

    if ((await this.client.hget(channel, newName)) !== null) {
      throw new PartyError(400, PartyErrorCode.PartyNameAlreadyExist);
    }

    party.name = newName;

    await this.client.hset(channel, newName, Party.serialize(party));
    await this.client.hdel(channel, name);

    return party;
  }

  async updateType(channel: string, name: string, type: PartyQueueType) {
    const party = await this.getOne(channel, name);

    if (!party) {
      throw new PartyError(400, PartyErrorCode.PartyNameIsNotFound);
    }

    party.type = type;

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }

  async updateTime(channel: string, name: string, startedAt: DateTime) {
    const party = await this.getOne(channel, name);

    if (!party) {
      throw new PartyError(400, PartyErrorCode.PartyNameIsNotFound);
    }

    party.startedAt = startedAt.toISO().toString();

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }
}
