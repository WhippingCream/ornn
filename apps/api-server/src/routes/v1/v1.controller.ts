import { Controller, Get } from '@nestjs/common';
import { V1Service } from './v1.service';

@Controller('/api/v1')
export class V1Controller {
  constructor(private readonly rootService: V1Service) {}

  @Get()
  getHello(): string {
    return this.rootService.getHello();
  }
}
