import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialService } from '../material/material.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let supplierService: SupplierService;
  let materialService: MaterialService;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS()],
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
    const createdSupplier = await supplierService.create({ name: 'NTUC' });
    await materialService.create({
      name: 'mat1',
      energy: '10',
      supplier_id: createdSupplier.id,
    });
    const t = async () => {
      return await supplierService.remove(createdSupplier.id);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.SUPPLIER.TAGGED_MATERIALS(1),
    );
  });

  it('should prevent the creation of same name supplier', async () => {
    const dto: CreateSupplierDto = {
      name: 'NTUC',
    };
    const s1 = await supplierService.create(dto);
    const t = async () => {
      return await supplierService.create(dto);
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.SUPPLIER.SAME_NAME(s1.id),
    );
  });

  it('should prevent the updating to same name', async () => {
    const dto1: CreateSupplierDto = {
      name: 'NTUC',
    };
    const dto2: CreateSupplierDto = {
      name: 'NTUC2',
    };
    const s1 = await supplierService.create(dto1);
    const s2 = await supplierService.create(dto2);
    const t = async () => {
      return await supplierService.update(s2.id, { name: s1.name });
    };

    await expect(t).rejects.toThrowError(BadRequestException);
    await expect(t).rejects.toThrowError(
      ERROR_MESSAGE_FORMATS.SUPPLIER.SAME_NAME(s1.id),
    );
  });

  it('should update updated_at', async () => {
    const dto1: CreateSupplierDto = {
      name: 'NTUC',
    };

    const updateDto: UpdateSupplierDto = {
      name: 'NTUC2',
    };

    const s1 = await supplierService.create(dto1);

    // wait for 1 second before updating
    const s2: Supplier = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await supplierService.update(s1.id, updateDto));
      }, 1000);
    });

    const supplierInDb = await supplierService.findOne(s1.id);

    expect(s2).toBeDefined();
    expect(s2.created_at).not.toEqual(s2.updated_at);
    expect(supplierInDb.created_at).not.toEqual(supplierInDb.updated_at);
  });
});
