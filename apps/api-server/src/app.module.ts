import { DatabaseModule } from '@db';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { V1Module } from './routes/v1/v1.module';

@Module({
  imports: [DatabaseModule, TerminusModule, V1Module],
  controllers: [AppController],
})
export class AppModule {}
