import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { MaterialService } from '../material/material.service';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @Inject(forwardRef(() => MaterialService))
    private readonly materialService: MaterialService
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  async findAll() {
    return await this.supplierRepository.find();
  }

  async findOne(id: number) {
    return await this.supplierRepository.findOneBy({ id });
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    return this.supplierRepository.save({ ...supplier, ...updateSupplierDto });
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    // since many materials can't survive without supplier
    // check before deleting this supplier that there's no material belonging to it
    const taggedMaterials = await this.materialService.findTaggedSupplier(id);
    if (taggedMaterials.length > 0) {
      throw new BadRequestException(`There's still ${taggedMaterials.length} material(s) tagged to this supplier!`);
    }

    return this.supplierRepository.remove(supplier);
  }
}
