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

  toString(options: { participants: boolean } = { participants: false }) {
    const title = `[${this.convertPartyQueueTypeToString()}] ${this.name} (${
      this.users.length
    }/${this.getLimit()}) ${DateTime.fromISO(this.startedAt).toFormat(
      'HH:mm',
    )}`;

    if (!options.participants) return title;
    return [title]
      .concat(this.users.map((user, idx) => ` - [${idx + 1}] ${user.nickname}`))
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

  static parsePartyQueueType(typeString: string) {
    switch (typeString) {
      case '2':
        return 'Custom02';
      case '3':
        return 'Custom03';
      case '4':
        return 'Custom04';
      case '5':
        return 'Custom05';
      case '6':
        return 'Custom06';
      case '7':
        return 'Custom07';
      case '8':
        return 'Custom08';
      case '9':
        return 'Custom09';
      case '10':
        return 'Custom10';
      case '일반':
      case '노말':
        return 'Normal';
      case '솔랭':
      case '듀오':
        return 'SoloRank';
      case '자랭':
        return 'FreeRank';
      case '칼바':
      case '칼바람':
        return 'HowlingAbyss';
      case '내전':
        return 'FriendlyMatch';
      case '스크림':
      case '외전':
      case '친선':
        return 'Scrimmage';
      case '롤체':
      case 'tft':
      case '롤토체스':
        return 'TeamFightTactics';
      default:
        return null;
    }
  }
}
