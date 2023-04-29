import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ERROR_MESSAGE_FORMATS from '../common/error_message_formats';
import { Edge, Graph } from '../graph/graph';
import { Material } from '../material/entities/material.entity';
import { MaterialService } from '../material/material.service';
import {
  CreateProductDto,
  MaterialIdAndQuantity,
  SubProductIdAndQuantity,
} from './dto/create-product.dto';
import { NipDto, Nutrition, NutritionQuantity } from './dto/nip.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MaterialProduct } from './entities/material_product.entity';
import { Product } from './entities/product.entity';
import { ProductSubProduct } from './entities/product_sub_product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MaterialProduct)
    private readonly materialProductRepository: Repository<MaterialProduct>,
    @InjectRepository(ProductSubProduct)
    private readonly productSubProductRepository: Repository<ProductSubProduct>,
    private readonly materialService: MaterialService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    await this.checkNoSameName(createProductDto);

    const mappedMaterials = await this.checkMissingMaterials(createProductDto);
    const mappedSubProducts = await this.checkMissingSubProducts(
      createProductDto,
    );

    const { material_id_and_quantity, sub_product_id_and_quantity, ...dao } =
      createProductDto;
    const product = await this.productRepository.save({
      ...dao,
      sub_products: mappedSubProducts,
    });

    const materialProduct = await this.getMaterialProduct(
      product,
      material_id_and_quantity,
      mappedMaterials,
    );

    const createdMaterialProduct = await this.materialProductRepository.save(
      materialProduct,
    );

    const productSubProducts = await this.getProductSubProducts(
      product,
      sub_product_id_and_quantity,
      mappedSubProducts,
    );

    const createdProductSubProduct =
      await this.productSubProductRepository.save(productSubProducts);

    // remove nested information to compact
    return {
      ...product,
      material_product: createdMaterialProduct.map((mp) => mp.emptyNested()),
      product_sub_products: createdProductSubProduct.map((psp) =>
        psp.emptyNested(),
      ),
    };
  }

  async findAll() {
    return await findAll(this.productRepository);
  }

  async findOne(id: number) {
    return await findOne(this.productRepository, id);
  }

  async findOneByName(name: string) {
    return await findOneByName(this.productRepository, name);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const hasSubProductUpdate: boolean = 'sub_product_ids' in updateProductDto;
    const hasMaterialUpdate: boolean =
      'material_id_and_quantity' in updateProductDto;

    await this.checkNoSameName(updateProductDto);
    const product = await this.findOneOrThrow(id);
    const mappedMaterials = await this.checkMissingMaterials(updateProductDto);
    const mappedSubProducts = await this.checkMissingSubProducts(
      updateProductDto,
    );

    if (hasSubProductUpdate) {
      const cycles = await this.getCycles({
        dto: updateProductDto,
        product,
      });
      if (cycles.length > 0) {
        throw new BadRequestException(
          ERROR_MESSAGE_FORMATS.PRODUCT.CYCLIC_PRODUCTS(cycles),
        );
      }
    }

    const {
      material_id_and_quantity,
      sub_product_id_and_quantity,
      ...strippedDto
    } = updateProductDto;

    const dao: any = { ...strippedDto };

    if (hasMaterialUpdate) {
      await this.removePreviousMaterialProduct(product);
      const materialProduct = await this.getMaterialProduct(
        product,
        material_id_and_quantity,
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

  async remove(id: number) {
    const product = await this.findOneOrThrow(id);
    const parentProducts = await this.productRepository.find({
      relations: {
        product_sub_products: true,
      },
      where: {
        product_sub_products: {
          parent_id: id,
        },
      },
    });
    if (parentProducts.length > 0) {
      throw new BadRequestException(
        ERROR_MESSAGE_FORMATS.PRODUCT.HAS_PARENT_REFERENCE(
          parentProducts.map((p) => p.id),
        ),
      );
    }
    return await this.productRepository.remove(product);
  }

  async getNip(id: number): Promise<NipDto> {
    const product: Product = await this.findOneOrThrow(id);
    const nutritionPerServing: Nutrition =
      await calculateNutritionPerServingFromProduct({
        product,
        productRepository: this.productRepository,
      });
    return {
      name: product.name,
      serving_size: product.serving_size,
      serving_unit: product.serving_unit,
      serving_per_package: product.serving_per_package,
      per_serving: nutritionPerServing.copy().stringifyAndAppendUnits(),
      per_hundred: nutritionPerServing
        .copy()
        .divide(product.serving_size)
        .times(100)
        .stringifyAndAppendUnits(),
    };
  }

  async getCycles({
    dto,
    product,
  }: {
    dto: UpdateProductDto;
    product: Product;
  }): Promise<Edge<number>[]> {
    if (!dto || !dto.sub_product_id_and_quantity) return [];

    const subProductIds = dto.sub_product_id_and_quantity.map(
      (p) => p.sub_product_id,
    );

    if (product && subProductIds.includes(product.id)) {
      // trivial case, if there's a cycle with itself
      return [{ from: product.id, to: product.id }];
    }
    const graph: Graph<number> = await constructGraph({
      sub_product_ids: subProductIds,
      product_id: product.id,
      productRepository: this.productRepository,
      visitedProductIds: new Set<number>(),
    });

    return graph.getCycles();
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

  private async getProductSubProducts(
    product: Product,
    subProductIdAndQuantities: SubProductIdAndQuantity[] = [],
    mappedSubProducts: Product[] = [],
  ): Promise<ProductSubProduct[]> {
    if (!product || subProductIdAndQuantities.length == 0) {
      return Promise.resolve([]);
    }

    // then we insert here
    const product_sub_products_daos: ProductSubProduct[] = [];
    for (let i = 0; i < mappedSubProducts.length; i++) {
      const sub_product = mappedSubProducts[i];
      const quantity = subProductIdAndQuantities[i].quantity;
      const product_sub_product_dao: ProductSubProduct =
        new ProductSubProduct();
      product_sub_product_dao.child = sub_product;
      product_sub_product_dao.parent = product;
      product_sub_product_dao.quantity = quantity;
      product_sub_product_dao.parent_id = product.id;
      product_sub_product_dao.child_id = sub_product.id;

      product_sub_products_daos.push(product_sub_product_dao);
    }
    return product_sub_products_daos;
  }

  private async checkNoSameName(dto: UpdateProductDto) {
    if (!dto || !dto.name) return;
    const sameNameProduct = await this.findOneByName(dto.name);
    if (sameNameProduct) {
      throw new BadRequestException(
        ERROR_MESSAGE_FORMATS.PRODUCT.SAME_NAME(sameNameProduct.id),
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

  private async checkMissingMaterials(
    dto: UpdateProductDto,
  ): Promise<Material[]> {
    const materialIds = (dto.material_id_and_quantity ?? []).map(
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
        ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_MATERIALS(missingMaterialIds),
      );
    }

    return mappedMaterials;
  }

  private async checkMissingSubProducts(
    dto: UpdateProductDto,
  ): Promise<Product[]> {
    const subProductIds =
      dto?.sub_product_id_and_quantity?.map((psp) => psp.sub_product_id) ?? [];
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
        ERROR_MESSAGE_FORMATS.PRODUCT.MISSING_PRODUCTS(missingProductIds),
      );
    }

    return mappedSubProducts;
  }
}

// these needs to be here due to recursive nature
// ====================================================================================================================================
function calculateNutritionPerServingFromMaterialProduct(
  materials: MaterialProduct[] = [],
): Nutrition {
  if (materials.length === 0) {
    return new Nutrition();
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

  const initialNutrition: Nutrition = new Nutrition();
  for (const { nutrition, quantity } of nutritionQuantities) {
    initialNutrition.add(nutrition, quantity);
  }

  return initialNutrition;
}

async function calculateNutritionPerServingFromProduct({
  product,
  productRepository,
}: {
  product: Product;
  productRepository: Repository<Product>;
}): Promise<Nutrition> {
  const materialNutrition: Nutrition =
    calculateNutritionPerServingFromMaterialProduct(product.material_product);

  if (
    !product.product_sub_products ||
    product.product_sub_products.length == 0
  ) {
    // base case, when product doesn't have subproducts, it's a leaf node
    // then we just return the material nutrition
    return materialNutrition;
  }

  const subProducts: Product[] = await Promise.all(
    product.product_sub_products.map(async (psp) => {
      return await findOne(productRepository, psp.child_id);
    }),
  );
  // recursive case
  const subProductNutritions: Nutrition[] = await Promise.all(
    subProducts.map(
      async (product) =>
        await calculateNutritionPerServingFromProduct({
          product,
          productRepository,
        }),
    ),
  );

  return [materialNutrition, ...subProductNutritions].reduce((acc, cur) =>
    acc.add(cur),
  );
}

async function constructGraph({
  sub_product_ids,
  product_id,
  productRepository,
  visitedProductIds,
}: {
  sub_product_ids: number[];
  product_id: number;
  productRepository: Repository<Product>;
  visitedProductIds: Set<number>;
}): Promise<Graph<number>> {
  visitedProductIds.add(product_id);
  const g = new Graph<number>();
  if (!sub_product_ids || sub_product_ids.length === 0) {
    // base case, when there's no subproducts
    return g;
  }

  // add all the immediate child first
  for (const id of sub_product_ids) {
    g.addEdge({ from: product_id, to: id });
  }

  // if has seen before, dont process
  const filtered_sub_product_ids = sub_product_ids.filter(
    (id) => !visitedProductIds.has(id),
  );

  const child_products: Product[] = await Promise.all(
    filtered_sub_product_ids.map(async (id) => {
      return await findOne(productRepository, id);
    }),
  );

  const child_graphs: Graph<number>[] = await Promise.all(
    child_products.map(async (p) => {
      // recursively do it for child_products
      return await constructGraph({
        sub_product_ids: p.product_sub_products.map((sp) => sp.child_id),
        product_id: p.id,
        productRepository,
        visitedProductIds,
      });
    }),
  );

  return [g, ...child_graphs].reduce((acc, cur) => acc.merge(cur));
}

async function findAll(
  productRepository: Repository<Product>,
): Promise<Product[]> {
  return await productRepository.find({
    relations: {
      product_sub_products: {
        child: true,
      },
      material_product: {
        material: true,
      },
    },
  });
}

async function findOne(
  productRepository: Repository<Product>,
  id: number,
): Promise<Product> {
  return await productRepository.findOne({
    relations: {
      product_sub_products: {
        child: true,
      },
      material_product: {
        material: true,
      },
    },
    where: { id },
  });
}

async function findOneByName(
  productRepository: Repository<Product>,
  name: string,
): Promise<Product> {
  return await productRepository.findOne({
    relations: {
      product_sub_products: {
        child: true,
      },
      material_product: {
        material: true,
      },
    },
    where: { name },
  });
}
// ====================================================================================================================================
