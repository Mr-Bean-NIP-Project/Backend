import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { MaterialService } from '../material/material.service';
import { Material } from '../material/entities/material.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly materialService: MaterialService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const materialIds = createProductDto.material_ids;
    const mappedMaterials = await Promise.all(
      materialIds.map(async (mat) => {
        return await this.materialService.findOne(mat);
      }),
    );
    const missingMaterialIds = await this.getMissingMaterialIds(
      materialIds,
      mappedMaterials,
    );
    if (missingMaterialIds.length > 0) {
      throw new BadRequestException(
        `Missing Materials with ID(s): ${missingMaterialIds.join(',')}`,
      );
    }

    const subProductIds = createProductDto.sub_product_ids;
    const mappedSubProducts = await Promise.all(
      subProductIds.map(async (mat) => {
        return await this.findOne(mat);
      }),
    );
    const missingProductIds = await this.getMissingProductIds(
      subProductIds,
      mappedSubProducts,
    );

    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Missing Products with ID(s): ${missingProductIds.join(',')}`,
      );
    }
    return await this.productRepository.save({
      ...createProductDto,
      materials: mappedMaterials,
      sub_products: mappedSubProducts,
    });
  }

  async findAll() {
    return await this.productRepository.find({
      relations: {
        sub_products: true,
        materials: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findOne({
      relations: {
        sub_products: true,
        materials: true,
      },
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    const materialIds = updateProductDto.material_ids;
    const mappedMaterials = await Promise.all(
      materialIds.map(async (mat) => {
        return await this.materialService.findOne(mat);
      }),
    );
    const missingMaterialIds = await this.getMissingMaterialIds(
      materialIds,
      mappedMaterials,
    );
    if (missingMaterialIds.length > 0) {
      throw new BadRequestException(
        `Missing Materials with ID(s): ${missingMaterialIds.join(',')}`,
      );
    }

    const subProductIds = updateProductDto.sub_product_ids;
    const mappedSubProducts = await Promise.all(
      subProductIds.map(async (mat) => {
        return await this.findOne(mat);
      }),
    );
    const missingProductIds = await this.getMissingProductIds(
      subProductIds,
      mappedSubProducts,
    );
    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Missing Products with ID(s): ${missingProductIds.join(',')}`,
      );
    }

    return await this.productRepository.save({
      ...product,
      ...updateProductDto,
      materials: mappedMaterials,
      sub_products: mappedSubProducts,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    const parentProducts = await this.productRepository.find({
      relations: {
        sub_products: true,
      },
      where: {
        sub_products: {
          id,
        },
      },
    });
    if (parentProducts.length > 0) {
      throw new BadRequestException(
        `Please remove products that references this with ID(s): ${parentProducts
          .map((p) => p.id)
          .join(',')}`,
      );
    }
    return await this.productRepository.remove(product);
  }

  async getMissingMaterialIds(
    materialIds: number[],
    mappedMaterials?: Material[],
  ): Promise<number[]> {
    if (!materialIds || materialIds.length == 0) return [];
    if (!mappedMaterials) {
      mappedMaterials = await Promise.all(
        materialIds.map(async (mat) => {
          return await this.materialService.findOne(mat);
        }),
      );
    }
    const missingMaterialIds = mappedMaterials
      .map((mat, index) => {
        return [mat, index];
      }) // put index first
      .filter((mat) => !mat[0]) // gives us nulls
      .map((mat) => mat[1]) // gives us the indexes
      .map((index) => materialIds[index as number]);

    return missingMaterialIds;
  }

  async getMissingProductIds(
    subProductIds: number[],
    mappedSubProducts?: Product[],
  ): Promise<number[]> {
    if (!subProductIds || subProductIds.length == 0) return [];
    if (!mappedSubProducts) {
      mappedSubProducts = await Promise.all(
        subProductIds.map(async (mat) => {
          return await this.findOne(mat);
        }),
      );
    }

    const missingProductIds = mappedSubProducts
      .map((prod, index) => {
        return [prod, index];
      }) // put index first
      .filter((prod) => !prod[0]) // gives us nulls
      .map((prod) => prod[1]) // gives us the indexes
      .map((index) => subProductIds[index as number]);
    return missingProductIds;
  }
}
