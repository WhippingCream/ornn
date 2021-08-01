import { DateTime } from 'luxon';

export interface IPartyUser {
  id: string;
  nickname: string;
  joinedAt: string;
}

export type PartyQueueType =
  | 'Normal'
  | 'SoloRank'
  | 'FreeRank'
  | 'HowlingAbyss'
  | 'FriendlyMatch'
  | 'Scrimmage'
  | 'TeamFightTactics'
  | 'Custom02'
  | 'Custom03'
  | 'Custom04'
  | 'Custom05'
  | 'Custom06'
  | 'Custom07'
  | 'Custom08'
  | 'Custom09'
  | 'Custom10';

interface IParty {
  type: PartyQueueType;
  startedAt: string;
  users?: IPartyUser[];
}

export class Party implements IParty {
  name: string;
  type: PartyQueueType;
  startedAt: string;
  users: IPartyUser[];

  constructor(
    name: string,
    type: PartyQueueType,
    startedAt: DateTime,
    users?: IPartyUser[],
  ) {
    this.name = name;
    this.type = type;
    this.startedAt = startedAt.toISO().toString();
    this.users = users || [];
  }
  getLimit() {
    switch (this.type) {
      case 'Custom02':
      case 'SoloRank':
        return 2;
      case 'Custom03':
        return 3;
      case 'Custom04':
        return 4;
      case 'Custom05':
      case 'Normal':
      case 'FreeRank':
      case 'HowlingAbyss':
      case 'Scrimmage':
        return 5;
      case 'Custom06':
        return 6;
      case 'Custom07':
        return 7;
      case 'Custom08':
      case 'TeamFightTactics':
        return 8;
      case 'Custom09':
        return 9;
      case 'Custom10':
      case 'FriendlyMatch':
        return 10;
    }
  }

  private convertPartyQueueTypeToString() {
    switch (this.type) {
      case 'Custom02':
      case 'Custom03':
      case 'Custom04':
      case 'Custom05':
      case 'Custom06':
      case 'Custom07':
      case 'Custom08':
      case 'Custom09':
      case 'Custom10':
        return '기타';
      case 'Normal':
        return '일반';
      case 'SoloRank':
        return '솔랭';
      case 'FreeRank':
        return '자랭';
      case 'HowlingAbyss':
        return '칼바';
      case 'FriendlyMatch':
        return '내전';
      case 'Scrimmage':
        return '스크림';
      case 'TeamFightTactics':
        return '롤체';
    }
  }

  userAdd(id: string, nickname: string) {
    if (this.users.find((user) => user.id === id)) return false;

    this.users.push({
      id,
      nickname,
      joinedAt: DateTime.now().toISO().toString(),
    });

    return true;
  }

  userDel(id: string) {
    const idx = this.users.findIndex((user) => user.id === id);
    if (idx === -1) return false;

    this.users.splice(idx, 1);

    return true;
  }

  userDelByIdx(idx: number) {
    if (idx > this.users.length || idx === 0) return false;

    this.users.splice(idx - 1, 1);

    return true;
  }

  toString(verbose?: boolean) {
    const title = `[${this.convertPartyQueueTypeToString()}] ${this.name} (${
      this.users.length
    }/${this.getLimit()})`;

    if (!verbose) return title;
    return [title]
      .concat(
        this.users.map(
          (user, idx) =>
            ` - [${idx + 1} / ${idx + 1 > this.getLimit() ? '⏳' : '✅'}] ${
              user.nickname
            }`,
        ),
      )
      .join('\n');
  }

  setTime(obj: { hour: number; minute: number }) {
    const dt = DateTime.fromObject(obj);
    const str = (dt.diffNow().valueOf() <= 0
      ? dt.plus({
          day: 1,
        })
      : dt
    )
      .toISO()
      .toString();

    this.startedAt = str;
  }

  static serialize(party: Party) {
    return JSON.stringify({
      type: party.type,
      users: party.users,
      startedAt: party.startedAt,
    });
  }

  static deserialize(name: string, data: string) {
    const { type, startedAt, users }: IParty = JSON.parse(data) as IParty;

    return new Party(name, type, DateTime.fromISO(startedAt), users);
  }
}
