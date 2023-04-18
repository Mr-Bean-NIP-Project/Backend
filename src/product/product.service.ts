import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Material } from '../material/entities/material.entity';
import { MaterialService } from '../material/material.service';
import {
  CreateProductDto,
  MaterialIdAndQuantity,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MaterialProduct } from './entities/material_product.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MaterialProduct)
    private readonly materialProductRepository: Repository<MaterialProduct>,
    private readonly materialService: MaterialService,
  ) {}

  @Transactional()
  async create(createProductDto: CreateProductDto) {
    await this.checkNoSameName(createProductDto);
    const materialIds = createProductDto.material_id_and_quantity.map(
      (x) => x.material_id,
    );
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

    const { material_id_and_quantity, sub_product_ids, ...dao } =
      createProductDto;
    const product = await this.productRepository.save({
      ...dao,
      sub_products: mappedSubProducts,
    });

    const materialProduct = await this.getMaterialProduct(
      product,
      createProductDto.material_id_and_quantity,
      mappedMaterials,
    );

    const createdMaterialProduct = await this.materialProductRepository.save(
      materialProduct,
    );

    return {
      ...product,
      sub_products: mappedSubProducts.map((sp) => {
        // remove nested information to compact
        sp.emptySubProductAndMaterialProduct();
        return sp;
      }),
      material_product: createdMaterialProduct.map((mp) => {
        // remove nested information to compact
        mp.emptyNested();
        return mp;
      }),
    };
  }

  @Transactional()
  async findAll() {
    return await this.productRepository.find({
      relations: {
        sub_products: true,
        material_product: {
          material: true,
          product: true,
        },
      },
    });
  }

  @Transactional()
  async findOne(id: number) {
    return await this.productRepository.findOne({
      relations: {
        sub_products: true,
        material_product: {
          material: true,
          product: true,
        },
      },
      where: { id },
    });
  }

  @Transactional()
  async findOneByName(name: string) {
    return await this.productRepository.findOne({
      relations: {
        sub_products: true,
        material_product: {
          material: true,
          product: true,
        },
      },
      where: { name },
    });
  }

  @Transactional()
  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.checkNoSameName(updateProductDto);
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    if (
      updateProductDto.sub_product_ids &&
      updateProductDto.sub_product_ids.includes(product.id)
    ) {
      throw new BadRequestException(`Cyclic sub product not allowed!`);
    }
    const materialIds = updateProductDto.material_id_and_quantity.map(
      (x) => x.material_id,
    );
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

    await this.removePreviousMaterialProduct(product);
    const materialProduct = await this.getMaterialProduct(
      product,
      updateProductDto.material_id_and_quantity,
      mappedMaterials,
    );

    const { material_id_and_quantity, sub_product_ids, ...dao } =
      updateProductDto;
    const newProduct = await this.productRepository.save({
      ...product,
      ...dao,
      material_product: materialProduct,
      sub_products: mappedSubProducts,
    });

    await this.materialProductRepository.save(materialProduct);

    return newProduct;
  }

  @Transactional()
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

  async removePreviousMaterialProduct(
    product: Product,
  ): Promise<MaterialProduct[]> {
    if (!product) return Promise.resolve([]);
    const previousMaterialProducts = await this.materialProductRepository.find({
      where: {
        product_id: product.id,
      },
    });

    return await this.materialProductRepository.remove(
      previousMaterialProducts,
    );
  }

  async getMaterialProduct(
    product: Product,
    materialIdAndQuantities: MaterialIdAndQuantity[],
    mappedMaterials?: Material[],
  ): Promise<MaterialProduct[]> {
    if (!product || materialIdAndQuantities.length == 0)
      return Promise.resolve([]);
    if (!mappedMaterials) {
      const materialIds = materialIdAndQuantities.map((x) => x[0]);
      mappedMaterials = await Promise.all(
        materialIds.map(async (mat) => {
          return await this.materialService.findOne(mat);
        }),
      );
    }

    // then we insert here
    const material_product_daos: MaterialProduct[] = [];
    for (let i = 0; i < mappedMaterials.length; i++) {
      const material = mappedMaterials[i];
      const material_quantity = materialIdAndQuantities[i].quantity;
      const material_product_dao: MaterialProduct = new MaterialProduct();
      material_product_dao.material = material;
      material_product_dao.product = product;
      material_product_dao.material_quantity = material_quantity;
      material_product_dao.product_id = product.id;
      material_product_dao.material_id = material.id;

      material_product_daos.push(material_product_dao);
    }
    return material_product_daos;
  }

  async checkNoSameName(dto: UpdateProductDto) {
    if (!dto || !dto.name) return;
    const sameNameProduct = await this.findOneByName(dto.name);
    if (sameNameProduct) {
      throw new BadRequestException(
        `Product with id: ${sameNameProduct.id} has the same name!`,
      );
    }
  }
}
