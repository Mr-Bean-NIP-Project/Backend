import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { CreateMaterialDto } from '../material/dto/create-material.dto';
import { MaterialModule } from '../material/material.module';
import { MaterialService } from '../material/material.service';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { SupplierService } from '../supplier/supplier.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Nutrition } from './dto/nip.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, SERVING_UNIT } from './entities/product.entity';
import { ProductModule } from './product.module';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let productService: ProductService;
  let materialService: MaterialService;
  let supplierService: SupplierService;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS(), MaterialModule, ProductModule],
      providers: [ProductService, MaterialService, SupplierService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    materialService = module.get<MaterialService>(MaterialService);
    supplierService = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should create product(s) (no material/subproduct)', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const createdProduct = await productService.create(dto);
    const productInDb = await productService.findOne(createdProduct.id);

    expect(createdProduct).toEqual(productInDb);
  });

  it('should create product(s) with subproduct (no material)', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const createdProduct1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      ...dto1,
      name: 'p2',
      sub_product_id_and_quantity: [
        { product_id: createdProduct1.id, quantity: 1 },
      ],
    };
    const createdProduct2 = await productService.create(dto2);

    const product1InDb = await productService.findOne(createdProduct1.id);
    const product2InDb = await productService.findOne(createdProduct2.id);

    expect(createdProduct1).toEqual(product1InDb);
    expect(createdProduct2).toEqual(product2InDb);
  });

  it('should create product(s) with material (no subproduct)', async () => {
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
      sub_product_id_and_quantity: [],
    };
    const createdProduct1 = await productService.create(dto1);

    const product1InDb = await productService.findOne(createdProduct1.id);
    expect(createdProduct1).toEqual(product1InDb);
  });

  it('should create 1 product with material and subproduct', async () => {
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
      sub_product_id_and_quantity: [],
    };
    const createdProduct1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      ...dto1,
      name: 'p2',
      sub_product_id_and_quantity: [
        { product_id: createdProduct1.id, quantity: 1 },
      ],
    };
    const createdProduct2 = await productService.create(dto2);

    const product1InDb = await productService.findOne(createdProduct1.id);
    const product2InDb = await productService.findOne(createdProduct2.id);

    expect(createdProduct1).toEqual(product1InDb);
    expect(createdProduct2).toEqual(product2InDb);
  });

  it('should get all product(s)', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const dto2: CreateProductDto = {
      ...dto1,
      name: 'p2',
    };

    const p1 = await productService.create(dto1);
    const p2 = await productService.create(dto2);

    const products = await productService.findAll();
    expect(products).toContainEqual(p1);
    expect(products).toContainEqual(p2);
  });

  it('should prevent creation of same name', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const dto2: CreateProductDto = {
      ...dto1,
    };

    const p1 = await productService.create(dto1);

    const t = async () => {
      return await productService.create(dto2);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.SAME_NAME(p1.id),
    );
  });

  it('should prevent updating to same name', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const dto2: CreateProductDto = {
      ...dto1,
      name: 'p2',
    };

    const p1 = await productService.create(dto1);
    const p2 = await productService.create(dto2);

    const t = async () => {
      return await productService.update(p2.id, { name: p1.name });
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.SAME_NAME(p1.id),
    );
  });

  it('should fail to create product with unknown material', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [{ material_id: 1, quantity: 1 }],
      sub_product_id_and_quantity: [],
    };
    const t = async () => {
      return await productService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_MATERIALS([1]),
    );
  });

  it('should fail to create product with unknown sub-product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: 1, quantity: 1 }],
    };
    const t = async () => {
      return await productService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_PRODUCTS([1]),
    );
  });

  it('should fail to update product cylic subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const t = async () => {
      return await productService.update(p1.id, {
        sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
      });
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.CYCLIC_PRODUCTS([
        { from: p1.id, to: p1.id },
      ]),
    );
  });

  it('should update successfully', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: UpdateProductDto = {
      name: 'p2',
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.update(p1.id, dto2);

    const productInDb = await productService.findOne(p2.id);
    expect(p2).toEqual(productInDb);
    expect(p1.product_sub_products).toHaveLength(
      dto1.sub_product_id_and_quantity.length,
    );
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.product_sub_products).toHaveLength(
      dto2.sub_product_id_and_quantity.length,
    );
    expect(p2.material_product).toHaveLength(
      dto2.material_id_and_quantity.length,
    );
  });

  it('should update successfully with subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p3 = await productService.update(p2.id, updateDto);

    const productInDb = await productService.findOne(p3.id);
    const { product_sub_products: s2, ...p2NoSubProduct } = p2;
    const { product_sub_products: s3, ...p3NoSubProduct } = p3;
    // check if all other fields are the same
    expect(p2NoSubProduct).toEqual(p3NoSubProduct);
    expect(p3).toEqual(productInDb);
    expect(p1.product_sub_products).toHaveLength(
      dto1.sub_product_id_and_quantity.length,
    );
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.product_sub_products).toHaveLength(
      dto2.sub_product_id_and_quantity.length,
    );
    expect(p2.material_product).toHaveLength(
      dto2.material_id_and_quantity.length,
    );
    expect(p3.product_sub_products).toHaveLength(
      updateDto.sub_product_id_and_quantity.length,
    );
    expect(p3.material_product).toHaveLength(
      updateDto.material_id_and_quantity.length,
    );
  });

  it('should update successfully with material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
    });

    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.update(p1.id, updateDto);

    const productInDb = await productService.findOne(p2.id);
    const { material_product: mp1, ...p1NoMp } = p1;
    const { material_product: mp2, ...p2NoMp } = p2;
    // check if all other fields are the same
    expect(p1NoMp).toEqual(p2NoMp);
    expect(p2).toEqual(productInDb);
    expect(p1.product_sub_products).toHaveLength(
      dto1.sub_product_id_and_quantity.length,
    );
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.product_sub_products).toHaveLength(
      updateDto.sub_product_id_and_quantity.length,
    );
    expect(p2.material_product).toHaveLength(
      updateDto.material_id_and_quantity.length,
    );
  });

  it('should update successfully with material and subproduct', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
    });

    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const updatedProduct = await productService.update(p2.id, updateDto);

    const productInDb = await productService.findOne(updatedProduct.id);
    const {
      material_product: mp1,
      product_sub_products: sp1,
      ...updatedProductNoMpNoSubProduct
    } = updatedProduct;
    const {
      material_product: mp2,
      product_sub_products: sp2,
      ...p2NoMpNoSubProduct
    } = p2;
    // check if all other fields are the same
    expect(updatedProductNoMpNoSubProduct).toEqual(p2NoMpNoSubProduct);
    expect(updatedProduct).toEqual(productInDb);
    expect(p1.product_sub_products).toHaveLength(
      dto1.sub_product_id_and_quantity.length,
    );
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.product_sub_products).toHaveLength(
      dto2.sub_product_id_and_quantity.length,
    );
    expect(p2.material_product).toHaveLength(
      dto2.material_id_and_quantity.length,
    );
    expect(updatedProduct.product_sub_products).toHaveLength(
      updateDto.sub_product_id_and_quantity.length,
    );
    expect(updatedProduct.material_product).toHaveLength(
      updateDto.material_id_and_quantity.length,
    );
  });

  it('should update successfully without wiping previous subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      name: 'p3',
    };
    const updatedProduct = await productService.update(p2.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if sub_product ids are unchanged
    expect(updatedProduct.product_sub_products).toEqual(
      p2.product_sub_products,
    );
    expect(productInDb.product_sub_products).toEqual(p2.product_sub_products);
  });

  it('should update successfully without wiping previous material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
    });

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
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      name: 'p2',
    };
    const updatedProduct = await productService.update(p1.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if material_products are unchanged
    expect(updatedProduct.material_product).toEqual(p1.material_product);
    expect(productInDb.material_product).toEqual(p1.material_product);
  });

  it('should update successfully without wiping previous material and subproducts', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
    });

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
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 1,
        },
      ],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      name: 'p3',
    };
    const updatedProduct = await productService.update(p2.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if material_products are unchanged
    expect(updatedProduct.material_product).toEqual(p2.material_product);
    expect(productInDb.material_product).toEqual(p2.material_product);
    expect(updatedProduct.product_sub_products).toEqual(
      p2.product_sub_products,
    );
    expect(productInDb.product_sub_products).toEqual(p2.product_sub_products);
  });

  it('should update successfully and replace previous subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p2 = await productService.create(dto2);

    const dto3: CreateProductDto = {
      name: 'p3',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p3 = await productService.create(dto3);

    // changing p2 sub_product from p1.id to p3.id
    const updateDto: UpdateProductDto = {
      name: 'p4',
      sub_product_id_and_quantity: [{ product_id: p3.id, quantity: 1 }],
    };
    const updatedProduct = await productService.update(p2.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if sub_product ids are unchanged
    expect(updatedProduct.product_sub_products).not.toEqual(
      p2.product_sub_products,
    );
    expect(productInDb.product_sub_products).not.toEqual(
      p2.product_sub_products,
    );
  });

  it('should update successfully and replace previous material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial1 = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
    });
    const createdMaterial2 = await materialService.create({
      name: 'mat2',
      supplier_id: createdSupplier.id,
    });

    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial1.id,
          quantity: 1,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      name: 'p2',
      material_id_and_quantity: [
        {
          material_id: createdMaterial2.id,
          quantity: 1,
        },
      ],
    };
    const updatedProduct = await productService.update(p1.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if material_products are unchanged
    expect(updatedProduct.material_product).not.toEqual(p1.material_product);
    expect(productInDb.material_product).not.toEqual(p1.material_product);
  });

  it('should fail to update a product that does not exist', async () => {
    const t = async () => {
      return await productService.update(100, {});
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should fail to update a product with a material that does not exist', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [
        {
          material_id: 1, // doesnt exist
          quantity: 1,
        },
      ],
    };

    const t = async () => {
      return await productService.update(p1.id, updateDto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_MATERIALS([1]),
    );
  });

  it('should fail to update a product with a subproduct that does not exist', async () => {
    const missingProductId = 10;
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      sub_product_id_and_quantity: [
        { product_id: missingProductId, quantity: 1 },
      ], // doesnt exist
    };

    const t = async () => {
      return await productService.update(p1.id, updateDto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_PRODUCTS([missingProductId]),
    );
  });

  it('should fail to update a product with a material that does not exist', async () => {
    const t = async () => {
      return await productService.remove(1);
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should fail to delete a product that does not exist', async () => {
    const t = async () => {
      return await productService.remove(1);
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it("should fail to delete a product is part of another product's subproduct (fail cos have parents)", async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p2 = await productService.create(dto2);

    const t = async () => {
      return await productService.remove(p1.id);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.PRODUCT.HAS_PARENT_REFERENCE([p2.id]),
    );
  });

  it('should successfully remove a product', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    await productService.remove(p1.id);

    expect(await productService.findOne(p1.id)).toBeNull();
  });

  it('should return empty NIP for untagged product', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const nip = await productService.getNip(p1.id);
    expect(nip.name).toEqual(p1.name);
    expect(nip.serving_size).toEqual(p1.serving_size);
    expect(nip.serving_unit).toEqual(p1.serving_unit);
    expect(nip.serving_per_package).toEqual(p1.serving_per_package);
    expect(nip.per_serving).toEqual(new Nutrition().stringifyAndAppendUnits());
    expect(nip.per_hundred).toEqual(new Nutrition().stringifyAndAppendUnits());
  });

  it('should return NIP for product tagged to 1 material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 1600;
    expectedNutritionPerServing.protein = 1000;

    const nip = await productService.getNip(p1.id);
    expect(nip.name).toEqual(p1.name);
    expect(nip.serving_size).toEqual(p1.serving_size);
    expect(nip.serving_unit).toEqual(p1.serving_unit);
    expect(nip.serving_per_package).toEqual(p1.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should return NIP for product tagged to many material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial1 = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const createdMaterial2 = await materialService.create({
      name: 'mat2',
      supplier_id: createdSupplier.id,
      energy: '1000',
      protein: '600',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial1.id,
          quantity: 2,
        },
        {
          material_id: createdMaterial2.id,
          quantity: 3,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 4600;
    expectedNutritionPerServing.protein = 2800;

    const nip = await productService.getNip(p1.id);
    expect(nip.name).toEqual(p1.name);
    expect(nip.serving_size).toEqual(p1.serving_size);
    expect(nip.serving_unit).toEqual(p1.serving_unit);
    expect(nip.serving_per_package).toEqual(p1.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should return NIP for product tagged to 1 subproduct tagged to 1 material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const quantity = 2;

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity }],
    };
    const p2 = await productService.create(dto2);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 1600 * quantity;
    expectedNutritionPerServing.protein = 1000 * quantity;

    const nip = await productService.getNip(p2.id);
    expect(nip.name).toEqual(p2.name);
    expect(nip.serving_size).toEqual(p2.serving_size);
    expect(nip.serving_unit).toEqual(p2.serving_unit);
    expect(nip.serving_per_package).toEqual(p2.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should return NIP for product tagged to 1 subproduct tagged to many material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial1 = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const createdMaterial2 = await materialService.create({
      name: 'mat2',
      supplier_id: createdSupplier.id,
      energy: '1000',
      protein: '600',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial1.id,
          quantity: 2,
        },
        {
          material_id: createdMaterial2.id,
          quantity: 3,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const quantity = 3;

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity }],
    };
    const p2 = await productService.create(dto2);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 4600 * quantity;
    expectedNutritionPerServing.protein = 2800 * quantity;

    const nip = await productService.getNip(p2.id);
    expect(nip.name).toEqual(p2.name);
    expect(nip.serving_size).toEqual(p2.serving_size);
    expect(nip.serving_unit).toEqual(p2.serving_unit);
    expect(nip.serving_per_package).toEqual(p2.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should return NIP for product tagged to many subproduct tagged to 1 material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.create(dto2);

    const quantity = 5;

    const dto3: CreateProductDto = {
      name: 'p3',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [
        { product_id: p1.id, quantity },
        { product_id: p2.id, quantity },
      ],
    };
    const p3 = await productService.create(dto3);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 3200 * quantity;
    expectedNutritionPerServing.protein = 2000 * quantity;

    const nip = await productService.getNip(p3.id);
    expect(nip.name).toEqual(p3.name);
    expect(nip.serving_size).toEqual(p3.serving_size);
    expect(nip.serving_unit).toEqual(p3.serving_unit);
    expect(nip.serving_per_package).toEqual(p3.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should return NIP for product tagged to many subproduct tagged to many material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial1 = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier.id,
      energy: '800',
      protein: '500',
    });
    const createdMaterial2 = await materialService.create({
      name: 'mat2',
      supplier_id: createdSupplier.id,
      energy: '1000',
      protein: '600',
    });
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial1.id,
          quantity: 2,
        },
        {
          material_id: createdMaterial2.id,
          quantity: 3,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [
        {
          material_id: createdMaterial1.id,
          quantity: 2,
        },
        {
          material_id: createdMaterial2.id,
          quantity: 3,
        },
      ],
      sub_product_id_and_quantity: [],
    };
    const p2 = await productService.create(dto2);

    const quantity = 10;

    const dto3: CreateProductDto = {
      name: 'p3',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [
        { product_id: p1.id, quantity },
        { product_id: p2.id, quantity },
      ],
    };
    const p3 = await productService.create(dto3);

    const expectedNutritionPerServing: Nutrition = new Nutrition();
    expectedNutritionPerServing.energy = 9200 * quantity;
    expectedNutritionPerServing.protein = 5600 * quantity;

    const nip = await productService.getNip(p3.id);
    expect(nip.name).toEqual(p3.name);
    expect(nip.serving_size).toEqual(p3.serving_size);
    expect(nip.serving_unit).toEqual(p3.serving_unit);
    expect(nip.serving_per_package).toEqual(p3.serving_per_package);
    expect(nip.per_serving).toEqual(
      expectedNutritionPerServing.copy().stringifyAndAppendUnits(),
    );
    expect(nip.per_hundred).toEqual(
      expectedNutritionPerServing
        .copy()
        .divide(nip.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    );
  });

  it('should prevent cyclic products beyond trivial case', async () => {
    // should catch 4 => 3 => 2 => 1 THEN we try to update with a cycle
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p1.id, quantity: 1 }],
    };
    const p2 = await productService.create(dto2);

    const dto3: CreateProductDto = {
      name: 'p3',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p2.id, quantity: 1 }],
    };
    const p3 = await productService.create(dto3);

    const dto4: CreateProductDto = {
      name: 'p4',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [{ product_id: p3.id, quantity: 1 }],
    };
    const p4 = await productService.create(dto4);

    const updateDto: UpdateProductDto = {
      sub_product_id_and_quantity: [{ product_id: p4.id, quantity: 1 }],
    };

    // now we try to update p1 with p4 as sub product aka 1 => 4
    const t1 = async () => {
      return await productService.update(p1.id, { ...updateDto });
    };
    await expect(t1).rejects.toThrowError(BadRequestException);

    // now we try to update p2 with p4 as sub product aka 2 => 4
    const t2 = async () => {
      return await productService.update(p2.id, { ...updateDto });
    };
    await expect(t2).rejects.toThrowError(BadRequestException);

    // now we try to update p3 with p4 as sub product aka 3 => 4
    const t3 = async () => {
      return await productService.update(p3.id, { ...updateDto });
    };
    await expect(t3).rejects.toThrowError(BadRequestException);

    // now we try to update p4 with p4 as sub product aka 4 => 4
    const t4 = async () => {
      return await productService.update(p4.id, { ...updateDto });
    };
    await expect(t4).rejects.toThrowError(BadRequestException);
  });

  it('should update updated_at', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 200,
      serving_unit: SERVING_UNIT.G,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_id_and_quantity: [],
    };

    const updateDto: UpdateProductDto = {
      name: 'p2',
    };

    const p1 = await productService.create(dto1);

    // wait for 1 second before updating
    const p2: Product = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await productService.update(p1.id, updateDto));
      }, 1000);
    });

    const productInDb = await productService.findOne(p1.id);

    expect(p2).toBeDefined();
    expect(p2.created_at).not.toEqual(p2.updated_at);
    expect(productInDb.created_at).not.toEqual(productInDb.updated_at);
  });
});
