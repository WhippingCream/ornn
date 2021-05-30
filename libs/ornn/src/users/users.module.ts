import { Module } from '@nestjs/common';
import { OrnnUsersService } from './users.service';

@Module({
  providers: [OrnnUsersService],
  exports: [OrnnUsersService],
})
export class OrnnUsersModule {}
