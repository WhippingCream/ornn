import { Test, TestingModule } from '@nestjs/testing';

import { PartyManagerService } from './party-manager.service';

describe('PartyService', () => {
  let service: PartyManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartyManagerService],
    }).compile();

    service = module.get<PartyManagerService>(PartyManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
