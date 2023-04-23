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
import { Propagation, Transactional } from 'typeorm-transactional';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @Inject(forwardRef(() => MaterialService))
    private readonly materialService: MaterialService,
  ) {}

  @Transactional({ propagation: Propagation.NESTED })
  async create(createSupplierDto: CreateSupplierDto) {
    await this.checkNoSameName(createSupplierDto);
    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findAll() {
    return await this.supplierRepository.find();
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findOne(id: number) {
    return await this.supplierRepository.findOneBy({ id });
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findOneByName(name: string) {
    return await this.supplierRepository.findOneBy({ name });
  }

  @Transactional({ propagation: Propagation.NESTED })
  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.checkNoSameName(updateSupplierDto);
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    return this.supplierRepository.save({ ...supplier, ...updateSupplierDto });
  }

  @Transactional({ propagation: Propagation.NESTED })
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
        ERROR_MESSAGE_FORMATS.SUPPLIER.TAGGED_MATERIALS(taggedMaterials.length),
      );
    }

    return this.supplierRepository.remove(supplier);
  }

  async checkNoSameName(dto: UpdateSupplierDto) {
    if (!dto || !dto.name) return;
    const sameNameSupplier = await this.findOneByName(dto.name);
    if (sameNameSupplier) {
      throw new BadRequestException(
        ERROR_MESSAGE_FORMATS.SUPPLIER.SAME_NAME(sameNameSupplier.id),
      );
    }
  }
}
