import { ModelBaseController } from '@lib/db/base/base.controller';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
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
import { CreateKakaoUserDto } from './dto/create.user.dto';
import { UpdateKakaoUserDto } from './dto/update.user.dto';
import { KakaoUserService } from './users.service';

@ApiTags('카카오톡 사용자(채널 종속) v1')
@Controller('/api/v1/kakao/users')
export class KakaoUserController extends ModelBaseController {
  constructor(protected service: KakaoUserService) {
    super();
  }

  @Get()
  findAll(): Promise<[KakaoUsersEntity[], number]> {
    return this.service.getList();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<KakaoUsersEntity> {
    return this.service.getOne(id);
  }

  @Post()
  @HttpCode(201) // created
  async createOne(
    @Body() createDto: CreateKakaoUserDto,
  ): Promise<InsertResult> {
    const result = await this.service.createOne(createDto);
    return result;
  }

  @Put(':id')
  @HttpCode(204) // no content
  updateOne(
    @Param('id') id: number,
    @Body() updateDto: UpdateKakaoUserDto,
  ): Promise<UpdateResult> {
    return this.service.updateOne(id, updateDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: number): Promise<DeleteResult> {
    return this.service.removeOne(id);
  }
}
