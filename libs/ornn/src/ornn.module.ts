import { Module } from '@nestjs/common';
import { OrnnUsersModule } from './users/users.module';

@Module({
  imports: [OrnnUsersModule],
  exports: [OrnnUsersModule],
})
export class OrnnModule {}
