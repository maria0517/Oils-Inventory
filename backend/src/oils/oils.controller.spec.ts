import { Test, TestingModule } from '@nestjs/testing';
import { OilsController } from './oils.controller';
import { OilsService } from './oils.service';

describe('OilsController', () => {
  let controller: OilsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OilsController],
      providers: [OilsService],
    }).compile();

    controller = module.get<OilsController>(OilsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
