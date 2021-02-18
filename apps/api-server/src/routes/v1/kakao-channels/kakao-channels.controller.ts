import { ModelBaseController } from '@db/base/base.controller';
import { KakaoChannelEntity } from '@db/entities/kakaoTalk/channel.entity';
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
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateKakaoChannelDto } from './dto/create.kakao-channel.dto';
import { UpdateKakaoChannelDto } from './dto/update.kakao-channel.dto';
import { KakaoChannelService } from './kakao-channels.service';

@ApiTags('카카오톡 채널 v1')
@Controller('/api/v1/kakao/channels')
export class KakaoChannelController extends ModelBaseController {
  constructor(protected service: KakaoChannelService) {
    super();
  }

  @Get()
  findAll(): Promise<[KakaoChannelEntity[], number]> {
    return this.service.getList();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<KakaoChannelEntity> {
    return this.service.getOne(id);
  }

  @Post()
  @HttpCode(201) // created
  async createOne(
    @Body() createDto: CreateKakaoChannelDto,
  ): Promise<InsertResult> {
    const result = await this.service.createOne(createDto);
    return result;
  }

  @Put(':id')
  @HttpCode(204) // no content
  updateOne(
    @Param('id') id: number,
    @Body() updateDto: UpdateKakaoChannelDto,
  ): Promise<UpdateResult> {
    return this.service.updateOne(id, updateDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: number): Promise<DeleteResult> {
    return this.service.removeOne(id);
  }
}
