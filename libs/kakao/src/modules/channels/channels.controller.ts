import { ModelBaseController } from '@lib/db/base/base.controller';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateKakaoChannelDto } from './dto/create.channel.dto';
import { UpdateKakaoChannelDto } from './dto/update.channel.dto';
import { KakaoChannelService } from './channels.service';

@ApiTags('카카오톡 채널 v1')
@Controller('/api/v1/kakao/channels')
export class KakaoChannelController extends ModelBaseController {
  constructor(protected service: KakaoChannelService) {
    super();
  }

  @Get()
  findAll(): Promise<[KakaoChannelsEntity[], number]> {
    return this.service.getList();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<KakaoChannelsEntity | undefined> {
    return this.service.getOne(id);
  }

  @Post()
  @HttpCode(201) // created
  createOne(
    @Body() createDto: CreateKakaoChannelDto,
  ): Promise<number | undefined> {
    return this.service.createOne(createDto);
  }

  @Put(':id')
  @HttpCode(204) // no content
  updateOne(
    @Param('id') id: number,
    @Body() updateDto: UpdateKakaoChannelDto,
  ): Promise<number> {
    return this.service.updateOne(id, updateDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: number): Promise<number> {
    return this.service.removeOne(id);
  }
}
