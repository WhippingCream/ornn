import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('오른 인증 v1')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Put('sign-in')
  async signIn(
    @Body() dto: SignInDto,
  ): Promise<OrnnUsersEntity & { accessToken: string }> {
    const result = await this.authService.signIn(dto);

    if (!('accessToken' in result)) {
      throw new BadRequestException('');
    }

    return result;
  }

  @Put('sign-up')
  async signUp(@Body() dto: SignUpDto): Promise<OrnnUsersEntity> {
    const result = await this.authService.signUp(dto);

    if (!(result instanceof OrnnUsersEntity)) {
      throw new BadRequestException('');
    }

    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
