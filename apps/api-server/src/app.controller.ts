import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(private health: HealthCheckService) {}

  @Get('/health')
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
