import { SERVING_UNIT } from '../entities/product.entity';

export enum NUMBER_OF_DP {
    energy = 0,
    protein = 1,
    total_fat = 1,
    saturated_fat = 1,
    trans_fat = 1,
    cholesterol = 0,
    carbohydrate = 1,
    sugars = 1,
    dietary_fibre = 1,
    sodium = 0,
}

export interface Nutrition<T> {
  energy: T;
  protein: T;
  total_fat: T;
  saturated_fat: T;
  trans_fat: T;
  cholesterol: T;
  carbohydrate: T;
  sugars: T;
  dietary_fibre: T;
  sodium: T;
}

export class NipDto {
  name: string;
  serving_size: number;
  serving_unit: SERVING_UNIT;
  serving_per_package: number;
  per_serving: Nutrition<string>;
  per_hundred: Nutrition<string>;
}
