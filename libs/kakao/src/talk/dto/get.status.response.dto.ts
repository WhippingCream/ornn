export interface SimpleChannelDto {
  id: string;
  activeUserCount: number;
  linkId: string;
  linkName: string;
  linkURL: string;
  searchable: boolean;
  userList: {
    id: string;
    nickname: string;
  }[];
}

export interface GetKakaoStatusResponseDto {
  logon: boolean;

  channels?: SimpleChannelDto[];
}
