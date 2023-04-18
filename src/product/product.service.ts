import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Big, { BigSource } from 'big.js';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Material } from '../material/entities/material.entity';
import { MaterialService } from '../material/material.service';
import {
  CreateProductDto,
  MaterialIdAndQuantity,
} from './dto/create-product.dto';
import {
  GET_EMPTY_NUTRITION,
  NUMBER_OF_DP,
  NipDto,
  Nutrition,
  NutritionQuantity,
} from './dto/nip.dto';
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
    const materialIds = (createProductDto.material_id_and_quantity ?? []).map(
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

    const subProductIds = createProductDto.sub_product_ids ?? [];
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

    // remove nested information to compact
    return {
      ...product,
      sub_products: mappedSubProducts.map((sp) =>
        sp.emptySubProductAndMaterialProduct(),
      ),
      material_product: createdMaterialProduct.map((mp) => mp.emptyNested()),
    };
  }

  @Transactional()
  async findAll() {
    return await this.productRepository.find({
      relations: {
        sub_products: true,
        material_product: {
          material: true,
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
        },
      },
      where: { name },
    });
  }

  @Transactional()
  async update(id: number, updateProductDto: UpdateProductDto) {
    const hasSubProductUpdate: boolean = 'sub_product_ids' in updateProductDto;
    const hasMaterialUpdate: boolean =
      'material_id_and_quantity' in updateProductDto;

    await this.checkNoSameName(updateProductDto);
    const product = await this.findOneOrThrow(id);
    if (
      hasSubProductUpdate &&
      updateProductDto.sub_product_ids.includes(product.id)
    ) {
      throw new BadRequestException(`Cyclic sub product not allowed!`);
    }
    const materialIds = (updateProductDto.material_id_and_quantity ?? []).map(
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

    const subProductIds = updateProductDto.sub_product_ids ?? [];
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

    const { material_id_and_quantity, sub_product_ids, ...strippedDto } =
      updateProductDto;

    const dao: any = { ...strippedDto };

    if (hasMaterialUpdate) {
      await this.removePreviousMaterialProduct(product);
      const materialProduct = await this.getMaterialProduct(
        product,
        updateProductDto.material_id_and_quantity,
        mappedMaterials,
      );
      const createdMaterialProduct = await this.materialProductRepository.save(
        materialProduct,
      );
      dao.material_product = createdMaterialProduct.map((mp) =>
        mp.emptyNested(),
      );
    }

    if (hasSubProductUpdate) {
      dao.sub_products = mappedSubProducts;
    }

    const newProduct: Product = await this.productRepository.save({
      ...product,
      ...dao,
    });

    return newProduct;
  }

  @Transactional()
  async remove(id: number) {
    const product = await this.findOneOrThrow(id);
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

  @Transactional()
  async getNip(id: number): Promise<NipDto> {
    const product: Product = await this.findOneOrThrow(id);

    const subProductNutritions: Nutrition[] = product.sub_products.map((p) =>
      this.calculateNutritionFromMaterialProduct(p.material_product),
    );
    const materialNutrition: Nutrition =
      this.calculateNutritionFromMaterialProduct(product.material_product);

    const nutritionPerServing: Nutrition = [
      materialNutrition,
      ...subProductNutritions,
    ].reduce((acc, cur) => acc.addOtherNutrition(cur));

    return {
      name: product.name,
      serving_size: product.serving_size,
      serving_unit: product.serving_unit,
      serving_per_package: product.serving_per_package,
      per_serving: nutritionPerServing.toString(),
      per_hundred: nutritionPerServing
        .copy()
        .divide(product.serving_size)
        .times(100)
        .toString(),
    };
  }

  // given a product's tagged materials, calcualte the nutrition quantity
  private calculateNutritionFromMaterialProduct(
    materials: MaterialProduct[] = [],
  ): Nutrition {
    if (materials.length === 0) {
      return GET_EMPTY_NUTRITION();
    }
    const nutritionQuantities = materials.map((m) => {
      const {
        id,
        name,
        created_at,
        updated_at,
        supplier,
        material_product,
        ...nutrition
      } = m.material; // strip unused fields
      return {
        nutrition,
        quantity: m.material_quantity,
      };
    }) as NutritionQuantity[];

    const initialNutrition: Nutrition = GET_EMPTY_NUTRITION();
    for (const { nutrition, quantity } of nutritionQuantities) {
      initialNutrition.addOtherNutrition(nutrition, quantity);
    }

    return initialNutrition;
  }

  private async getMissingMaterialIds(
    materialIds: number[] = [],
    mappedMaterials: Material[] = [],
  ): Promise<number[]> {
    if (!materialIds || materialIds.length == 0) return [];
    const missingMaterialIds = mappedMaterials
      .map((mat, index) => {
        return [mat, index];
      }) // put index first
      .filter((mat) => !mat[0]) // gives us nulls
      .map((mat) => mat[1]) // gives us the indexes
      .map((index) => materialIds[index as number]);

    return missingMaterialIds;
  }

  private async getMissingProductIds(
    subProductIds: number[] = [],
    mappedSubProducts: Product[] = [],
  ): Promise<number[]> {
    if (!subProductIds || subProductIds.length == 0) return [];

    const missingProductIds = mappedSubProducts
      .map((prod, index) => {
        return [prod, index];
      }) // put index first
      .filter((prod) => !prod[0]) // gives us nulls
      .map((prod) => prod[1]) // gives us the indexes
      .map((index) => subProductIds[index as number]);
    return missingProductIds;
  }

  private async removePreviousMaterialProduct(
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

  private async getMaterialProduct(
    product: Product,
    materialIdAndQuantities: MaterialIdAndQuantity[] = [],
    mappedMaterials: Material[] = [],
  ): Promise<MaterialProduct[]> {
    if (!product || materialIdAndQuantities.length == 0) {
      return Promise.resolve([]);
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

  private async checkNoSameName(dto: UpdateProductDto) {
    if (!dto || !dto.name) return;
    const sameNameProduct = await this.findOneByName(dto.name);
    if (sameNameProduct) {
      throw new BadRequestException(
        `Product with id: ${sameNameProduct.id} has the same name!`,
      );
    }
  }

  private async findOneOrThrow(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    return product;
  }
}
