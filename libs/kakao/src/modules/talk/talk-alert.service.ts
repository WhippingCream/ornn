import { ChatBuilder, KnownChatType, Long, MentionContent } from 'node-kakao';

import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { KakaoTalkService } from './talk.service';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class KakaoTalkAlertService {
  constructor(
    private readonly talkService: KakaoTalkService,
    private readonly partyManagerService: PartyManagerService,
  ) {}

  @Cron('1 */1 * * * *') // every minutes
  async partyMonitor() {
    for (const channel of this.talkService.client.channelList.all()) {
      const parties = await this.partyManagerService.getAll(
        channel.channelId.toString(),
      );

      for (const party of parties) {
        const diffNowMillis = DateTime.fromISO(party.startedAt)
          .toLocal()
          .diffNow()
          .valueOf();

        if (diffNowMillis > 240000 && diffNowMillis <= 300000) {
          // if (diffNowMillis > 60000 && diffNowMillis <= 120000) {
          const chatBuilder = new ChatBuilder().text(
            `'${party.name}' 파티가 곧 시작합니다.\n\n`,
          );

          party.users.forEach((user, idx) => {
            if (idx < party.getLimit())
              chatBuilder
                .append(
                  new MentionContent({
                    userId: Long.fromString(user.id),
                    nickname: user.nickname,
                    profileURL: '',
                  }),
                )
                .text(' ');
          });

          channel.sendChat(chatBuilder.build(KnownChatType.TEXT));
        }

        // if (
        //   diffNowMillis > 0 &&
        //   diffNowMillis <= 60000 &&
        //   party.type === 'FriendlyMatch'
        // ) {
        //   channel.sendChat(
        //     new ChatBuilder()
        //       .text(
        //         `/자동매칭 ${party.users
        //           .filter((user, idx) => idx < party.getLimit())
        //           .map((user) => user.nickname.split('/')[0])
        //           .join(',')}`,
        //       )
        //       .build(KnownChatType.TEXT),
        //   );
        //   channel.sendChat(
        //     new ChatBuilder()
        //       .text(
        //         '※닉네임 뒤에 @1, @2를 붙이면 팀을 미리 나눌 수 있습니다.\nEx. /자동매칭 ZeroBoom@1,버스타는고먐미@2,캇셀프라임,잠탱이다, ...\n가능하면 서폿이랑 정글은 미리 나누고 하시면 밸런스 맞추는데 도움이 됩니다!',
        //       )
        //       .build(KnownChatType.TEXT),
        //   );
        // }
      }
    }
  }
}
