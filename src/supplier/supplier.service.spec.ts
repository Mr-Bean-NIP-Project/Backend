import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Material } from '../material/entities/material.entity';
import { MaterialService } from '../material/material.service';
import { MaterialProduct } from '../product/entities/material_product.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from './entities/supplier.entity';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let supplierService: SupplierService;
  let materialService: MaterialService;

  beforeEach(async () => {
    const dataSourceOptions: DataSourceOptions = {
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Supplier, Material, MaterialProduct, Product],
      synchronize: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([
          Supplier,
          Material,
          MaterialProduct,
          Product,
        ]),
      ],
      providers: [SupplierService, MaterialService],
    }).compile();

    supplierService = module.get<SupplierService>(SupplierService);
    materialService = module.get<MaterialService>(MaterialService);
  });

  it('should be defined', () => {
    expect(supplierService).toBeDefined();
  });

  it('should create 1 supplier', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const supplierInDB = await supplierService.findOne(createdSupplier.id);

    expect(supplierInDB).toStrictEqual(createdSupplier);
  });

  it('should get all suppliers', async () => {
    const createdSupplier1 = await supplierService.create({ name: 'NTUC' });
    const createdSupplier2 = await supplierService.create({ name: 'NTUC2' });

    const suppliers = await supplierService.findAll();

    expect(suppliers).toContainEqual(createdSupplier1);
    expect(suppliers).toContainEqual(createdSupplier2);
    expect(suppliers).toHaveLength(2);
  });

  it('should update supplier successfully', async () => {
    const newName = 'NTUC2';
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    await supplierService.update(createdSupplier.id, { name: newName });
    const supplierInDB = await supplierService.findOne(createdSupplier.id);

    const { name: createdName, ...createdSupplierOtherFields } =
      createdSupplier;
    const { name: updatedName, ...supplierInDBOtherFields } = supplierInDB;

    expect(supplierInDB.name).toBe(newName);

    expect(supplierInDBOtherFields).toStrictEqual(createdSupplierOtherFields);
  });

  it('should fail to update non-existent supplier', async () => {
    const t = async () => {
      return await supplierService.update(1, { name: 'NTUC2' });
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should delete supplier successfully', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    await supplierService.remove(createdSupplier.id);
    const supplierInDB = await supplierService.findOne(createdSupplier.id);

    expect(supplierInDB).toBeNull();
  });

  it('should fail to delete non-existent supplier', async () => {
    const t = async () => {
      return await supplierService.remove(1);
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should fail to delete supplier with existing materials', async () => {
    const t = async () => {
      const createdSupplier = await supplierService.create({ name: 'NTUC' });
      await materialService.create({
        name: 'mat1',
        energy: '10',
        supplier_id: createdSupplier.id,
      });
      return await supplierService.remove(createdSupplier.id);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
  });
});
