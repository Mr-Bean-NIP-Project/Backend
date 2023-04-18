import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SERVING_UNIT } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS(), MaterialModule],
      controllers: [ProductController],
      providers: [ProductService],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create 1 product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p = await controller.create(dto);
    expect(p.name).toBe(dto.name);
    expect(p.serving_size).toBe(dto.serving_size);
    expect(p.serving_unit).toBe(dto.serving_unit);
    expect(p.serving_per_package).toBe(dto.serving_per_package);
  });

  it('should find all product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p = await controller.create(dto);

    const products = await controller.findAll();
    expect(products).toContainEqual(p);
  });

  it('should find one product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p = await controller.create(dto);

    const product = await controller.findOne(JSON.stringify(p.id));
    expect(product).toEqual(p);
  });

  it('should remove one product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p = await controller.create(dto);

    await controller.remove(JSON.stringify(p.id));

    expect(await controller.findAll()).toHaveLength(0);
  });

  it('should update one product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p = await controller.create(dto);

    const updateDto: UpdateProductDto = {
      name: 'p2',
    };
    const updatedProduct = await controller.update(
      JSON.stringify(p.id),
      updateDto,
    );
    const productInDb = await controller.findOne(JSON.stringify(p.id));
    expect(productInDb).toEqual(updatedProduct);
  });
});
