import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConnectionModule } from './connection/connection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
    ConnectionModule,
  ],
})
export class DatabaseModule {}
