import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { Supplier } from '../supplier/entities/supplier.entity';
import { SupplierService } from '../supplier/supplier.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { Material } from './entities/material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { NotFoundException } from '@nestjs/common';

describe('MaterialController', () => {
  let controller: MaterialController;
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
      controllers: [MaterialController],
      providers: [MaterialService, SupplierService],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
    supplierService = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create 1 material', async () => {
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto: CreateMaterialDto = {
      name: 'Milk',
      supplier_id: createdSupplier.id,
    };

    const createdMaterial = await controller.create(materialDto);
    expect(createdMaterial.id).toBe(1);
    expect(createdMaterial.name).toStrictEqual(materialDto.name);
    expect(createdMaterial.supplier.id).toBe(createdSupplier.id);
  });

  it('should get all materials', async () => {
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto1: CreateMaterialDto = {
      name: 'Milk',
      supplier_id: createdSupplier.id,
    };
    const materialDto2: CreateMaterialDto = {
      name: 'Milk2',
      supplier_id: createdSupplier.id,
    };

    await controller.create(materialDto1);
    await controller.create(materialDto2);
    const materials = await controller.findAll();
    expect(materials).toHaveLength(2);
  });

  it('should get one materials', async () => {
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto1: CreateMaterialDto = {
      name: 'Milk',
      supplier_id: createdSupplier.id,
    };

    const createdMaterial = await controller.create(materialDto1);
    const material = await controller.findOne(
      JSON.stringify(createdMaterial.id),
    );

    expect(material).toStrictEqual(createdMaterial);
  });

  it('should update materials successfully', async () => {
    const newName = 'Milk2';
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto1: CreateMaterialDto = {
      name: 'Milk',
      supplier_id: createdSupplier.id,
    };
    const createdMaterial = await controller.create(materialDto1);
    await controller.update(JSON.stringify(createdMaterial.id), {
      name: newName,
    });

    const material = await controller.findOne(
      JSON.stringify(createdMaterial.id),
    );

    expect(material.name).toStrictEqual(newName);
  });

  it('should fail to update materials', async () => {
    const newName = 'Milk2';

    const t = async () => {
      return await controller.update(JSON.stringify(1), { name: newName });
    };

    await expect(t).rejects.toThrowError(NotFoundException);

  });

  it('should delete materials successfully', async () => {
    const newName = 'Milk2';
    const supplierDto: CreateSupplierDto = {
      name: 'sup1',
    };
    const createdSupplier = await supplierService.create(supplierDto);
    const materialDto1: CreateMaterialDto = {
      name: 'Milk',
      supplier_id: createdSupplier.id,
    };
    const createdMaterial = await controller.create(materialDto1);
    await controller.remove(JSON.stringify(createdMaterial.id));

    const material = await controller.findOne(
      JSON.stringify(createdMaterial.id),
    );

    expect(material).toBeNull();
  });

  it('should fail to delete materials', async () => {
    const t = async () => {
      return await controller.remove(JSON.stringify(1));
    };
    
    await expect(t).rejects.toThrowError(NotFoundException);

  });
});
