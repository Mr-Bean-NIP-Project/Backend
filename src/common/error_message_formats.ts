import { Edge } from '../graph/graph';
import { Material } from '../material/entities/material.entity';

const ERROR_MESSAGE_FORMATS = {
  PRODUCT: {
    MISSING_MATERIALS: (missingMaterialIds: number[] | string[]) =>
      `Missing Materials with ID(s): ${missingMaterialIds.join(', ')}`,
    MISSING_PRODUCTS: (missingProductIds: number[] | string[]) =>
      `Missing Products with ID(s): ${missingProductIds.join(', ')}`,
    CYCLIC_PRODUCTS: (cycles: Edge<string | number>[]) =>
      `Cyclic Product not allowed! Cycle(s) detected between product ids: ${cycles
        .map((c) => `(From: ${c.from}, To: ${c.to})`)
        .join(', ')}`,
    SAME_NAME: (id: string | number) =>
      `Product with id: ${id} has the same name!`,
  },
  SUPPLIER: {
    TAGGED_MATERIALS: (taggedMaterialsLength: number | string) =>
      `There's still ${taggedMaterialsLength} material(s) tagged to this supplier!`,
    SAME_NAME: (id: string | number) =>
      `Supplier with id: ${id} has the same name!`,
  },
  MATERIAL: {
    SAME_NAME: (id: string | number) =>
      `Material with id: ${id} has the same name!`,
  },
};
export default ERROR_MESSAGE_FORMATS;
