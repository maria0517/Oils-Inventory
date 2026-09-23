import { Test, TestingModule } from '@nestjs/testing';
import { OilsService } from './oils.service';

describe('OilsService', () => {
  let service: OilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OilsService],
    }).compile();

    service = module.get<OilsService>(OilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
