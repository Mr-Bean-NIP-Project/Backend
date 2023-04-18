import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { MaterialService } from '../material/material.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @Inject(forwardRef(() => MaterialService))
    private readonly materialService: MaterialService,
  ) {}

  @Transactional()
  async create(createSupplierDto: CreateSupplierDto) {
    await this.checkNoSameName(createSupplierDto);
    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  @Transactional()
  async findAll() {
    return await this.supplierRepository.find();
  }

  @Transactional()
  async findOne(id: number) {
    return await this.supplierRepository.findOneBy({ id });
  }

  @Transactional()
  async findOneByName(name: string) {
    return await this.supplierRepository.findOneBy({ name });
  }

  @Transactional()
  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.checkNoSameName(updateSupplierDto);
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    return this.supplierRepository.save({ ...supplier, ...updateSupplierDto });
  }

  @Transactional()
  async remove(id: number) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    // since many materials can't survive without supplier
    // check before deleting this supplier that there's no material belonging to it
    const taggedMaterials = await this.materialService.findTaggedSupplier(id);
    if (taggedMaterials.length > 0) {
      throw new BadRequestException(
        `There's still ${taggedMaterials.length} material(s) tagged to this supplier!`,
      );
    }

    return this.supplierRepository.remove(supplier);
  }

  async checkNoSameName(dto: UpdateSupplierDto) {
    if (!dto || !dto.name) return;
    const sameNameSupplier = await this.findOneByName(dto.name);
    if (sameNameSupplier) {
      throw new BadRequestException(
        `Supplier with id: ${sameNameSupplier.id} has the same name!`,
      );
    }
  }
}
