import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAuthController } from './employee-auth.controller';

describe('EmployeeAuthController', () => {
  let controller: EmployeeAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeAuthController],
    }).compile();

    controller = module.get<EmployeeAuthController>(EmployeeAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
