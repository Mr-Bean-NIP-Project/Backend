import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    jest.mock('typeorm-transactional', () => ({
      Transactional: () => jest.fn(),
    }));
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS(), MaterialModule],
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
