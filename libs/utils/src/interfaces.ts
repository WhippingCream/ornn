export interface CommonTime {
  hour: number;
  minute: number;
  second?: number;
}

export interface CommonDate {
  year?: number;
  month: number;
  day: number;
}

export interface CommonDateTime extends CommonDate, CommonTime {}
