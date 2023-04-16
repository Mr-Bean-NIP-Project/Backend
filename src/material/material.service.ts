import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { SupplierService } from '../supplier/supplier.service';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    private supplierService: SupplierService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto) {
    const supplier = await this.supplierService.findOne(
      createMaterialDto.supplier_id,
    );
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    const { supplier_id, ...dao } = createMaterialDto;
    const newMaterial = this.materialRepository.create({ ...dao, supplier });
    return await this.materialRepository.save(newMaterial);
  }

  async findAll() {
    return await this.materialRepository.find();
  }

  async findOne(id: number) {
    return await this.materialRepository.findOneBy({ id });
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.findOne(id);

    if (!material) {
      throw new NotFoundException('Material not found!');
    }

    const supplier = await this.supplierService.findOne(
      updateMaterialDto.supplier_id,
    );

    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }

    const { supplier_id, ...dao } = updateMaterialDto;
    return this.materialRepository.save({ ...material, ...dao, supplier });
  }

  async remove(id: number) {
    const material = await this.findOne(id);
    if (!material) {
      throw new NotFoundException('Material not found!');
    }
    return this.materialRepository.remove(material);
  }
}
