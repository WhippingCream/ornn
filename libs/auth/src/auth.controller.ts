import { DatabaseExceptionFilter } from '@lib/db/database-exception.filter';
import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  AuthExceptionFilter,
  OAuthExceptionFilter,
} from './auth-exception.filter';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('오른 인증 v1')
@Controller('api/v1/auth')
@UseFilters(new AuthExceptionFilter())
@UseFilters(new OAuthExceptionFilter())
@UseFilters(new DatabaseExceptionFilter())
export class AuthController {
  constructor(private authService: AuthService) {}

  @Put('sign-in')
  signIn(
    @Body() dto: SignInDto,
  ): Promise<OrnnUsersEntity & { accessToken: string }> {
    return this.authService.signIn(dto);
  }

  @Put('sign-up')
  signUp(@Body() dto: SignUpDto): Promise<void> {
    return this.authService.signUp(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
