import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TYPEORM_TEST_IMPORTS } from '../common/typeorm_test_helper';
import { MaterialModule } from '../material/material.module';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  let controller: SupplierController;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    jest.mock('typeorm-transactional', () => ({
      Transactional: () => jest.fn(),
    }));
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TYPEORM_TEST_IMPORTS(), MaterialModule],
      controllers: [SupplierController],
      providers: [SupplierService],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create 1 supplier', async () => {
    const dto: CreateSupplierDto = {
      name: 'NTUC',
    };
    const result = await controller.create(dto);
    expect(result.id).toBe(1);
    expect(result.name).toStrictEqual(dto.name);
    expect(result.updated_at).not.toBeNull();
    expect(result.created_at).not.toBeNull();
  });

  it('should get all suppliers', async () => {
    const dto1: CreateSupplierDto = {
      name: 'NTUC',
    };
    const dto2: CreateSupplierDto = {
      name: 'NTUC2',
    };

    // create 2 suppliers
    await controller.create(dto1);
    await controller.create(dto2);

    const suppliers = await controller.findAll();
    expect(suppliers).toHaveLength(2);
  });

  it('should get one supplier', async () => {
    const dto1: CreateSupplierDto = {
      name: 'NTUC',
    };
    const dto2: CreateSupplierDto = {
      name: 'NTUC2',
    };

    // create 2 suppliers
    await controller.create(dto1);
    await controller.create(dto2);

    const supplier = await controller.findOne('1');
    expect(supplier.name).toBe(dto1.name);
  });

  it('should update supplier successfully', async () => {
    const newName = 'NEWNTUC';
    const dto: CreateSupplierDto = {
      name: 'NTUC',
    };
    const result = await controller.create(dto);
    await controller.update(JSON.stringify(result.id), { name: newName });

    const supplier = await controller.findOne(JSON.stringify(result.id));
    expect(supplier.name).toBe(newName);
  });

  it('should fail to update supplier', async () => {
    const newName = 'NEWNTUC';
    const t = async () => {
      return await controller.update(JSON.stringify(1), { name: newName });
    };
    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should delete supplier successfully', async () => {
    const newName = 'NEWNTUC';
    const dto: CreateSupplierDto = {
      name: 'NTUC',
    };
    const result = await controller.create(dto);
    await controller.remove(JSON.stringify(result.id));

    const supplier = await controller.findOne(JSON.stringify(result.id));
    expect(supplier).toBeNull();
  });

  it('should fail to delete supplier', async () => {
    const t = async () => {
      return await controller.remove(JSON.stringify(1));
    };
    await expect(t).rejects.toThrowError(NotFoundException);
  });
});
