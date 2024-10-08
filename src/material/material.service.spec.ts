import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { SupplierService } from '../supplier/supplier.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';

describe('MaterialService', () => {
  let materialService: MaterialService;
  let supplierService: SupplierService;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS()],
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
    const createdMaterial = await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    const materialInDb = await materialService.findOne(createdMaterial.id);

    expect(createdMaterial as Material).toEqual(materialInDb);
  });

  it('should fail to create material with non-existent supplier', async () => {
    const t = async () => {
      return await materialService.create({
        name: 'mat1',
        supplier_id: 1,
      });
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should get all materials', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const createdMaterial1 = await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    const createdMaterial2 = await materialService.create({
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
    expect(createdMaterial.supplier).toStrictEqual(createdSupplier1);

    const newDietaryFibre = '30';

    await materialService.update(createdMaterial.id, {
      dietary_fibre: newDietaryFibre,
      supplier_id: createdSupplier2.id,
    });

    const materialInDb = await materialService.findOne(createdMaterial.id);
    expect(materialInDb.name).toBe(name);
    expect(materialInDb.energy).toBe(energy);
    expect(materialInDb.dietary_fibre).toBe(newDietaryFibre);
    expect(materialInDb.supplier).toStrictEqual(createdSupplier2);
  });

  it('should fail to update non-existent material', async () => {
    const t = async () => {
      return await materialService.update(1, { name: 'mat3' });
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should fail to update material with non-existent supplier', async () => {
    const createdSupplier1 = await supplierService.create({ name: 'NTUC1' });
    const createdMaterial = await materialService.create({
      name: 'mat1',
      supplier_id: createdSupplier1.id,
    });

    const t = async () => {
      return await materialService.update(createdMaterial.id, {
        supplier_id: 203123, // does not exist
      });
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

  it('should prevent creation of same name material', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const dto: CreateMaterialDto = {
      name: 'mat1',
      supplier_id: createdSupplier.id,
    };
    const m1 = await materialService.create(dto);
    const t = async () => {
      return await materialService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.MATERIAL.SAME_NAME(m1.id),
    );
  });

  it('should prevent the updating to same name', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const dto1: CreateMaterialDto = {
      name: 'mat1',
      supplier_id: createdSupplier.id,
    };
    const dto2: CreateMaterialDto = {
      name: 'mat2',
      supplier_id: createdSupplier.id,
    };
    const m1 = await materialService.create(dto1);
    const m2 = await materialService.create(dto2);
    const t = async () => {
      return await materialService.update(m2.id, { name: m1.name });
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.MATERIAL.SAME_NAME(m1.id),
    );
  });

  it('should update updated_at', async () => {
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    const dto1: CreateMaterialDto = {
      name: 'm1',
      supplier_id: createdSupplier.id,
    };

    const updateDto: UpdateMaterialDto = {
      name: 'm2',
    };

    const m1 = await materialService.create(dto1);

    // wait for 1 second before updating
    const m2: Material = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await materialService.update(m1.id, updateDto));
      }, 1000);
    });

    const materialInDb = await materialService.findOne(m1.id);

    expect(m2).toBeDefined();
    expect(m2.created_at).not.toEqual(m2.updated_at);
    expect(materialInDb.created_at).not.toEqual(materialInDb.updated_at);
  });
});
