import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrnnModule } from 'libs/ornn/src';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { OauthCredentialsService } from './oauth-credentials.service';
import { OauthService } from './oauth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
    JwtModule.registerAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
        }),
      ],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('AUTHORIZATION_JWT_SECRET'),
        signOptions: {
          expiresIn: `${
            configService.get('AUTHORIZATION_JWT_EXPIRATION_MINUTES') || '60'
          }m`,
        },
      }),
      inject: [ConfigService],
    }),
    OrnnModule,
    HttpModule,
  ],
  providers: [AuthService, OauthService, JwtStrategy, OauthCredentialsService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
