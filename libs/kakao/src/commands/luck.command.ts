import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';
import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from './base.command';
import axios, { AxiosResponse } from "axios";

export class LuckCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'luck',
      aliases: ['운세'],
      helpMessage: [
        '/운세',
        ' - 운세 description',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: true,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: true,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: true,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: true,
        },
      ],
    });
  }

  execute = (data: TalkChatData, channel: TalkChannel, args: [string]) => {
    let result = '운세 result message.';
    let apiResult;
    
    if(validationCheck(args) == false)
      console.log('');
      // 실패시
    
    apiResult = callNaverLuckApi();

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(result)
        .build(KnownChatType.REPLY),
    );
  };
}

function validationCheck(args: string[]): boolean{
  let result:boolean = false;

  console.log("args : " + args);
  for(let i = 0; i < args.length; i++){
    if(args[i] == null) continue;
    let argsKey = args[i].split(':')[0];
    console.log(i + ' key : ' + argsKey);
    switch(argsKey){
      case '성별' : break;
      default :  
    }
  }

  return result;
}

function callNaverLuckApi(): any {
  const requestURL = 'https://m.search.naver.com/p/csearch/dcontent/external_api/json_todayunse_v2.naver?birth=19890623';
  let responseData: string = '';
  let jsonData;
  axios.get(requestURL).then(function (response) {
    //responseData = response.data.substring(39,response.data.length-2);
    responseData = response.data;
    console.log("1:" + responseData);
    jsonData = JSON.parse(responseData);
  }).catch(function (error) {
      console.log(error);
  });
}