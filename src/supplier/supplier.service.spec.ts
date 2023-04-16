import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let service: SupplierService;

  beforeEach(async () => {
    const dataSourceOptions: DataSourceOptions = {
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Supplier],
      synchronize: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([Supplier]),
      ],
      providers: [SupplierService],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create 1 supplier', async () => {
    const createdSupplier = await service.create({ name: 'NTUC' });
    const supplierInDB = await service.findOne(createdSupplier.id);

    expect(supplierInDB).toStrictEqual(createdSupplier);
  });

  it('should get all suppliers', async () => {
    const createdSupplier1 = await service.create({ name: 'NTUC' });
    const createdSupplier2 = await service.create({ name: 'NTUC2' });

    const suppliers = await service.findAll();

    expect(suppliers).toContainEqual(createdSupplier1);
    expect(suppliers).toContainEqual(createdSupplier2);
    expect(suppliers).toHaveLength(2);
  });

  it('should update supplier successfully', async () => {
    const newName = 'NTUC2';
    const createdSupplier = await service.create({ name: 'NTUC' });
    await service.update(createdSupplier.id, { name: newName });
    const supplierInDB = await service.findOne(createdSupplier.id);

    const { name: createdName, ...createdSupplierOtherFields } =
      createdSupplier;
    const { name: updatedName, ...supplierInDBOtherFields } = supplierInDB;

    expect(supplierInDB.name).toBe(newName);

    expect(supplierInDBOtherFields).toStrictEqual(createdSupplierOtherFields);
  });

  it('should fail to update non-existent supplier', async () => {
    const t = async () => {
      return await service.update(1, { name: 'NTUC2' });
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });

  it('should delete supplier successfully', async () => {
    const createdSupplier = await service.create({ name: 'NTUC' });
    await service.remove(createdSupplier.id);
    const supplierInDB = await service.findOne(createdSupplier.id);

    expect(supplierInDB).toBeNull();
  });

  it('should fail to delete non-existent supplier', async () => {
    const t = async () => {
      return await service.remove(1);
    };

    await expect(t).rejects.toThrowError(NotFoundException);
  });
});
