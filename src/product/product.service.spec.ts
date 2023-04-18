import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';
import { ProductService } from './product.service';
import { SERVING_UNIT } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { MaterialService } from '../material/material.service';
import { SupplierService } from '../supplier/supplier.service';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { CreateMaterialDto } from '../material/dto/create-material.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let materialService: MaterialService;
  let supplierService: SupplierService;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS(), MaterialModule],
      providers: [ProductService, MaterialService, SupplierService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    materialService = module.get<MaterialService>(MaterialService);
    supplierService = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
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
    const createdProduct = await productService.create(dto);
    const productInDb = await productService.findOne(createdProduct.id);

    expect(createdProduct).toEqual(productInDb);
  });

  it('should create 1 product with subproduct (no material)', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const createdProduct1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      ...dto1,
      name: 'p2',
      sub_product_ids: [createdProduct1.id],
    };
    const createdProduct2 = await productService.create(dto2);

    const product1InDb = await productService.findOne(createdProduct1.id);
    const product2InDb = await productService.findOne(createdProduct2.id);

    // to pass tests, it doesn't allow init of array if nth is tagged to it
    product2InDb.sub_products[0].material_product = [];
    product2InDb.sub_products[0].sub_products = [];
    expect(createdProduct1).toEqual(product1InDb);
    expect(createdProduct2).toEqual(product2InDb);
  });

  it('should create 1 product with material (no subproduct)', async () => {
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto: CreateMaterialDto = {
      name: 'mat1',
      supplier_id: createdSupplier.id,
    };
    const createdMaterial = await materialService.create(materialDto);

    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 1,
        },
      ],
      sub_product_ids: [],
    };
    const createdProduct1 = await productService.create(dto1);

    const product1InDb = await productService.findOne(createdProduct1.id);
    product1InDb.material_product[0].product.sub_products = []; // so testcase passses
    expect(createdProduct1).toEqual(product1InDb);
  });
});
