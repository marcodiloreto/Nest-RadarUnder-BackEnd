import { Test, TestingModule } from '@nestjs/testing';
import { GoogleApiController } from './google-api.controller';

describe('GoogleApiController', () => {
  let controller: GoogleApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleApiController],
    }).compile();

    controller = module.get<GoogleApiController>(GoogleApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
