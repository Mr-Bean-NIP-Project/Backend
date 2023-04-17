import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
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
