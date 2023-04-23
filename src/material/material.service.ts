import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierService } from '../supplier/supplier.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';
import { Propagation, Transactional } from 'typeorm-transactional';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @Inject(forwardRef(() => SupplierService))
    private supplierService: SupplierService,
  ) {}

  @Transactional({ propagation: Propagation.NESTED })
  async create(createMaterialDto: CreateMaterialDto) {
    const supplier = await this.supplierService.findOne(
      createMaterialDto.supplier_id,
    );
    if (!supplier) {
      throw new NotFoundException('Supplier not found!');
    }
    await this.checkNoSameName(createMaterialDto);
    const { supplier_id, ...dao } = createMaterialDto;
    const newMaterial = this.materialRepository.create({ ...dao, supplier });
    return await this.materialRepository.save(newMaterial);
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findAll() {
    return await this.materialRepository.find();
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findOne(id: number) {
    return await this.materialRepository.findOneBy({ id });
  }

  @Transactional({ propagation: Propagation.NESTED })
  async findOneByName(name: string) {
    return await this.materialRepository.findOneBy({ name });
  }

  @Transactional({ propagation: Propagation.NESTED })
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

    await this.checkNoSameName(updateMaterialDto);

    const { supplier_id, ...dao } = updateMaterialDto;
    return this.materialRepository.save({ ...material, ...dao, supplier });
  }

  @Transactional({ propagation: Propagation.NESTED })
  async remove(id: number) {
    const material = await this.findOne(id);
    if (!material) {
      throw new NotFoundException('Material not found!');
    }
    return this.materialRepository.remove(material);
  }

  async findTaggedSupplier(supplier_id: number) {
    return await this.materialRepository.find({
      where: {
        supplier: {
          id: supplier_id,
        },
      },
    });
  }

  async checkNoSameName(dto: UpdateMaterialDto) {
    if (!dto || !dto.name) return;
    const sameNameMaterial = await this.findOneByName(dto.name);
    if (sameNameMaterial) {
      throw new BadRequestException(
        ERROR_MESSAGE_FORMATS.MATERIAL.SAME_NAME(sameNameMaterial.id),
      );
    }
  }
}
