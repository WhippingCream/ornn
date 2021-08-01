import { Party, PartyQueueType } from './party.type';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class PartyManagerService {
  client: Redis;
  constructor(private readonly redisService: RedisService) {
    this.client = this.redisService.getClient('party');
  }

  async getAll(channel: string) {
    //
    // 만료 파티 삭제 코드 필요
    //

    const partyListData = await this.client.hgetall(channel);

    const partyList = Object.entries(partyListData).map(([name, data]) =>
      Party.deserialize(name, data),
    );

    return partyList;
  }

  async getOne(channel: string, name: string) {
    const data = await this.client.hget(channel, name);

    // if (!data) {
    //   throw new PartyError(404, PartyErrorCode.PartyNameNotFound);
    // }

    return data ? Party.deserialize(name, data) : null;
  }

  async create(
    channel: string,
    name: string,
    type: PartyQueueType,
    startedAt: DateTime,
  ) {
    const origin = await this.getOne(channel, name);

    if (origin) {
      return null;
    }

    // if (origin) {
    //   throw new PartyError(400, PartyErrorCode.PartyNameAlreadyExist);
    // }

    const party = new Party(name, type, startedAt);

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }

  async update(channel: string, name: string, party: Party) {
    const origin = await this.getOne(channel, name);

    if (!origin) {
      return null;
    }

    await this.client.hset(channel, name, Party.serialize(party));

    return party;
  }

  // async joinUser(
  //   channel: string,
  //   name: string,
  //   userId: bigint,
  //   nickname: string,
  // ) {
  //   const party = await this.getParty(channel, name);

  //   if (!party) {
  //     return null;
  //   }

  //   const limit = party.getLimit();

  //   if (party.users.length >= limit) {
  //     throw new PartyError(400, PartyErrorCode.PartyMemberIsFull);
  //   }

  //   party.users.push({
  //     id: userId,
  //     nickname,
  //   });

  //   await this.client.hset(channel, name, Party.serialize(party));

  //   return party;
  // }
}
