import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';
import { ProductService } from './product.service';
import { SERVING_UNIT } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  beforeAll(() => {
    initializeTransactionalContext();
  });

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

  it('should create 1 product (no material/subproduct)', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const createdProduct = await service.create(dto);
    const productInDb = await service.findOne(createdProduct.id);

    expect(createdProduct).toEqual(productInDb);
  });
});
