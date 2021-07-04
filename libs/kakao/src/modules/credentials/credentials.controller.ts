import { ModelBaseController } from '@lib/db/base/base.controller';
import { KakaoCredentialsEntity } from '@lib/db/entities/kakao/credential.entity';
import { Body, Controller, Get, HttpCode, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { generateString, generateUUID } from '@lib/utils/generators';
import { UpdateKakaoCredentialDto } from './dto/update.kakao-credential.dto';
import { KakaoCredentialService } from './credentials.service';

@ApiTags('카카오 로그인 정보 v1')
@Controller('/api/v1/kakao/credentials')
export class KakaoCredentialController extends ModelBaseController {
  constructor(protected service: KakaoCredentialService) {
    super();
  }

  @Get()
  async find(): Promise<KakaoCredentialsEntity | undefined> {
    let result = await this.service.getOne(1);
    if (!result) {
      await this.service.createOne({
        deviceId: generateUUID(4),
        clientName: `DESKTOP-${generateString(7)}`,
      });

      result = await this.service.getOne(1);
    }

    return result;
  }

  @Put()
  @HttpCode(204) // no content
  async updateOne(@Body() updateDto: UpdateKakaoCredentialDto): Promise<void> {
    const found = await this.service.getOne(1);

    if (!found) {
      await this.service.createOne({
        deviceId: generateUUID(4),
        clientName: `DESKTOP-${generateString(7)}`,
        ...updateDto,
      });
    }

    this.service.updateOne(1, updateDto);
  }
}
