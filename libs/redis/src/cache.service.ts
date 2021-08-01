import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CacheService {
  client: Redis;
  constructor(private readonly redisService: RedisService) {
    this.client = this.redisService.getClient('cache');
  }

  set(key: string, value: string) {
    return this.client.set(key, value);
  }

  get(key: string) {
    return this.client.get(key);
  }
}
