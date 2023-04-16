import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Supplier } from '../supplier/entities/supplier.entity';
import { SupplierService } from '../supplier/supplier.service';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';

describe('MaterialService', () => {
  let materialService: MaterialService;
  let supplierService: SupplierService;

  beforeEach(async () => {
    const dataSourceOptions: DataSourceOptions = {
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Material, Supplier],
      synchronize: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([Material, Supplier]),
      ],
      providers: [MaterialService, SupplierService],
    }).compile();

    materialService = module.get<MaterialService>(MaterialService);
    supplierService = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(materialService).toBeDefined();
  });

  it('should create 1 material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const { supplier, ...createdMaterial } = await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    const materialInDb = await materialService.findOne(createdMaterial.id);

    expect(createdMaterial as Material).toEqual(materialInDb);
  });

  it('should get all materials', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const { supplier: s1, ...createdMaterial1 } = await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    const { supplier: s2, ...createdMaterial2 } = await materialService.create({
      name: 'mat2',
      energy: '20',
      supplier_id: createdSupplier.id,
    });
    const materials = await materialService.findAll();

    expect(materials).toHaveLength(2);
    expect(materials).toContainEqual(createdMaterial1);
    expect(materials).toContainEqual(createdMaterial2);
  });

  it('update material successfully', async () => {
    const createdSupplier1 = await supplierService.create({ name: 'NTUC1' });
    const createdSupplier2 = await supplierService.create({ name: 'NTUC2' });

    const name = 'mat1';
    const energy = '10';
    const createdMaterial = await materialService.create({
      name,
      energy,
      supplier_id: createdSupplier1.id,
    });

    expect(createdMaterial.name).toBe(name);
    expect(createdMaterial.energy).toBe(energy);
    expect(createdMaterial.dietary_fibre).toBe('0');
    expect(createdMaterial.supplier_id).toBe(createdSupplier1.id);

    const newDietaryFibre = '30';

    await materialService.update(createdMaterial.id, {
      dietary_fibre: newDietaryFibre,
      supplier_id: createdSupplier2.id,
    });

    const materialInDb = await materialService.findOne(createdMaterial.id);
    expect(materialInDb.name).toBe(name);
    expect(materialInDb.energy).toBe(energy);
    expect(materialInDb.dietary_fibre).toBe(newDietaryFibre);
    expect(materialInDb.supplier_id).toBe(createdSupplier2.id);
  });

  it('should fail to update non-existent material', async () => {
    const t = async () => {
      return await materialService.update(1, { name: 'mat3' });
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('delete material successfully', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    await materialService.remove(createdMaterial.id);
    const materialInDb = await materialService.findOne(createdMaterial.id);

    expect(materialInDb).toBeNull();
  });

  it('should fail to delete non-existent material', async () => {
    const t = async () => {
      return await materialService.remove(1);
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });
});
