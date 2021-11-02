import { PartyError, PartyErrorCode } from './party.errors';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { Party } from './party.type';
import { PartyRepositoryService } from './party-repository.service';

@Injectable()
export class PartyManagerService {
  constructor(private readonly repoService: PartyRepositoryService) {}

  async getAll(channel: string) {
    return this.repoService.getAll(channel);
  }

  async pushUser(
    channel: string,
    name: string,
    userId: string,
    nickname: string,
  ) {
    const party = await this.repoService.getOne(channel, name);

    if (party.users.length >= party.getLimit()) {
      throw new PartyError(400, PartyErrorCode.PartyMemberIsFull);
    }

    if (party.users.find((user) => user.id === userId)) {
      throw new PartyError(400, PartyErrorCode.PartyMemberAlreadyJoined);
    }

    party.users.push({
      id: userId,
      nickname,
      joinedAt: DateTime.now().toISO().toString(),
    });

    await this.repoService.update(channel, name, party);

    return party;
  }

  async popUser(channel: string, name: string, userId: string) {
    const party = await this.repoService.getOne(channel, name);

    const index = party.users.findIndex((user) => user.id === userId);
    if (index === -1) {
      throw new PartyError(400, PartyErrorCode.PartyMemberIsNotFound);
    }

    if (party.type === 'FriendlyMatch') {
      const diffNowMills = DateTime.fromISO(party.startedAt)
        .toLocal()
        .diffNow()
        .valueOf();
      if (diffNowMills > 0 && diffNowMills < 1800000) {
        throw new PartyError(400, PartyErrorCode.FriendlyMatchExitTimeOver);
      }
    }

    party.users.splice(index - 1, 1);

    await this.repoService.update(channel, name, party);

    return party;
  }

  async popUserByIndex(channel: string, name: string, index: number) {
    const party = await this.repoService.getOne(channel, name);

    if (index > party.users.length || index === 0) {
      throw new PartyError(400, PartyErrorCode.PartyMemberIndexOutOfRange);
    }

    const user = party.users[index - 1];

    party.users.splice(index - 1, 1);

    await this.repoService.update(channel, name, party);

    return { party, user };
  }

  async replaceUser(
    channel: string,
    name: string,
    index: number,
    userId: string,
    nickname: string,
  ) {
    const party = await this.repoService.getOne(channel, name);

    if (index > party.users.length || index === 0) {
      throw new PartyError(400, PartyErrorCode.PartyMemberIndexOutOfRange);
    }

    if (party.users.find((user) => user.id === userId)) {
      throw new PartyError(400, PartyErrorCode.PartyMemberAlreadyJoined);
    }

    const user = party.users[index - 1];

    party.users.splice(index - 1, 1);

    party.users.push({
      id: userId,
      nickname,
      joinedAt: DateTime.now().toISO().toString(),
    });

    await this.repoService.update(channel, name, party);

    return { party, user };
  }

  async create(
    channel: string,
    name: string,
    type: string,
    startedAt: DateTime,
  ) {
    const queue = Party.parsePartyQueueType(type);

    if (!queue) {
      throw new PartyError(400, PartyErrorCode.PartyTypeCannotBeParsed);
    }

    return this.repoService.create(channel, name, queue, startedAt);
  }

  async updateName(channel: string, name: string, newName: string) {
    return this.repoService.updateName(channel, name, newName);
  }

  async updateType(channel: string, name: string, type: string) {
    const queue = Party.parsePartyQueueType(type);

    if (!queue) {
      throw new PartyError(400, PartyErrorCode.PartyTypeCannotBeParsed);
    }

    return this.repoService.updateType(channel, name, queue);
  }

  async updateTime(channel: string, name: string, startedAt: DateTime) {
    return this.repoService.updateTime(channel, name, startedAt);
  }
}
