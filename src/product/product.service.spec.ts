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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductModule } from './product.module';
import { GET_EMPTY_NUTRITION } from './dto/nip.dto';

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
      sub_product_ids: [],
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
      sub_product_ids: [],
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
      sub_product_ids: [],
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
      sub_product_ids: [],
    };
    const dto2: CreateProductDto = {
      ...dto1,
    };

    await productService.create(dto1);

    const t = async () => {
      return await productService.create(dto2);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });

  it('should prevent updating to same name', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
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
  });

  it('should fail to create product with unknown material', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [{ material_id: 1, quantity: 1 }],
      sub_product_ids: [],
    };
    const t = async () => {
      return await productService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });

  it('should fail to create product with unknown sub-product', async () => {
    const dto: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [1],
    };
    const t = async () => {
      return await productService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });

  it('should fail to update product cylic subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const t = async () => {
      return await productService.update(p1.id, { sub_product_ids: [p1.id] });
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });

  it('should update successfully', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: UpdateProductDto = {
      name: 'p2',
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p2 = await productService.update(p1.id, dto2);

    const productInDb = await productService.findOne(p2.id);
    expect(p2).toEqual(productInDb);
    expect(p1.sub_products).toHaveLength(dto1.sub_product_ids.length);
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.sub_products).toHaveLength(dto2.sub_product_ids.length);
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [],
      sub_product_ids: [p1.id],
    };
    const p3 = await productService.update(p2.id, updateDto);

    const productInDb = await productService.findOne(p3.id);
    const { sub_products: s2, ...p2NoSubProduct } = p2;
    const { sub_products: s3, ...p3NoSubProduct } = p3;
    // check if all other fields are the same
    expect(p2NoSubProduct).toEqual(p3NoSubProduct);
    expect(p3).toEqual(productInDb);
    expect(p1.sub_products).toHaveLength(dto1.sub_product_ids.length);
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.sub_products).toHaveLength(dto2.sub_product_ids.length);
    expect(p2.material_product).toHaveLength(
      dto2.material_id_and_quantity.length,
    );
    expect(p3.sub_products).toHaveLength(updateDto.sub_product_ids.length);
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_ids: [],
    };
    const p2 = await productService.update(p1.id, updateDto);

    const productInDb = await productService.findOne(p2.id);
    const { material_product: mp1, ...p1NoMp } = p1;
    const { material_product: mp2, ...p2NoMp } = p2;
    // check if all other fields are the same
    expect(p1NoMp).toEqual(p2NoMp);
    expect(p2).toEqual(productInDb);
    expect(p1.sub_products).toHaveLength(dto1.sub_product_ids.length);
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.sub_products).toHaveLength(updateDto.sub_product_ids.length);
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      material_id_and_quantity: [
        {
          material_id: createdMaterial.id,
          quantity: 2,
        },
      ],
      sub_product_ids: [p1.id],
    };
    const updatedProduct = await productService.update(p2.id, updateDto);

    const productInDb = await productService.findOne(updatedProduct.id);
    const {
      material_product: mp1,
      sub_products: sp1,
      ...updatedProductNoMpNoSubProduct
    } = updatedProduct;
    const {
      material_product: mp2,
      sub_products: sp2,
      ...p2NoMpNoSubProduct
    } = p2;
    // check if all other fields are the same
    expect(updatedProductNoMpNoSubProduct).toEqual(p2NoMpNoSubProduct);
    expect(updatedProduct).toEqual(productInDb);
    expect(p1.sub_products).toHaveLength(dto1.sub_product_ids.length);
    expect(p1.material_product).toHaveLength(
      dto1.material_id_and_quantity.length,
    );
    expect(p2.sub_products).toHaveLength(dto2.sub_product_ids.length);
    expect(p2.material_product).toHaveLength(
      dto2.material_id_and_quantity.length,
    );
    expect(updatedProduct.sub_products).toHaveLength(
      updateDto.sub_product_ids.length,
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [p1.id],
    };
    const p2 = await productService.create(dto2);

    const updateDto: UpdateProductDto = {
      name: 'p3',
    };
    const updatedProduct = await productService.update(p2.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if sub_product ids are unchanged
    expect(updatedProduct.sub_products).toEqual(p2.sub_products);
    expect(productInDb.sub_products).toEqual(p2.sub_products);
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
      sub_product_ids: [],
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
      sub_product_ids: [],
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
      sub_product_ids: [p1.id],
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
    expect(updatedProduct.sub_products).toEqual(p2.sub_products);
    expect(productInDb.sub_products).toEqual(p2.sub_products);
  });

  it('should update successfully and replace previous subproduct', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [p1.id],
    };
    const p2 = await productService.create(dto2);

    const dto3: CreateProductDto = {
      name: 'p3',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
    };
    const p3 = await productService.create(dto3);

    // changing p2 sub_product from p1.id to p3.id
    const updateDto: UpdateProductDto = {
      name: 'p4',
      sub_product_ids: [p3.id],
    };
    const updatedProduct = await productService.update(p2.id, updateDto);
    const productInDb = await productService.findOne(updatedProduct.id);

    expect(updatedProduct).toEqual(productInDb);

    // also need to check if sub_product ids are unchanged
    expect(updatedProduct.sub_products).not.toEqual(p2.sub_products);
    expect(productInDb.sub_products).not.toEqual(p2.sub_products);
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
      sub_product_ids: [],
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
  });

  it('should fail to update a product with a subproduct that does not exist', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
    };
    const p1 = await productService.create(dto1);

    const updateDto: UpdateProductDto = {
      sub_product_ids: [10], // doesnt exist
    };

    const t = async () => {
      return await productService.update(p1.id, updateDto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const dto2: CreateProductDto = {
      name: 'p2',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [p1.id],
    };
    await productService.create(dto2);

    const t = async () => {
      return await productService.remove(p1.id);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });

  it('should successfully remove a product', async () => {
    const dto1: CreateProductDto = {
      name: 'p1',
      serving_size: 10,
      serving_unit: SERVING_UNIT.ML,
      serving_per_package: 1,
      material_id_and_quantity: [],
      sub_product_ids: [],
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
      sub_product_ids: [],
    };
    const p1 = await productService.create(dto1);

    const nip = await productService.getNip(p1.id);
    expect(nip.name).toEqual(p1.name);
    expect(nip.serving_size).toEqual(p1.serving_size);
    expect(nip.serving_unit).toEqual(p1.serving_unit);
    expect(nip.serving_per_package).toEqual(p1.serving_per_package);
    expect(nip.per_serving).toEqual(GET_EMPTY_NUTRITION());
    expect(nip.per_hundred).toEqual(GET_EMPTY_NUTRITION());
  });
});
