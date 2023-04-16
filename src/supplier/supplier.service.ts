import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
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
    return this.supplierRepository.remove(supplier);
  }
}
