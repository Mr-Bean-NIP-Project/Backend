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

export const EMPTY_NUTRITION: Nutrition<string> = {
  energy: Number(0).toFixed(NUMBER_OF_DP.energy),
  protein: Number(0).toFixed(NUMBER_OF_DP.protein),
  total_fat: Number(0).toFixed(NUMBER_OF_DP.total_fat),
  saturated_fat: Number(0).toFixed(NUMBER_OF_DP.saturated_fat),
  trans_fat: Number(0).toFixed(NUMBER_OF_DP.trans_fat),
  cholesterol: Number(0).toFixed(NUMBER_OF_DP.cholesterol),
  carbohydrate: Number(0).toFixed(NUMBER_OF_DP.carbohydrate),
  sugars: Number(0).toFixed(NUMBER_OF_DP.sugars),
  dietary_fibre: Number(0).toFixed(NUMBER_OF_DP.dietary_fibre),
  sodium: Number(0).toFixed(NUMBER_OF_DP.sodium),
};

export class NipDto {
  name: string;
  serving_size: number;
  serving_unit: SERVING_UNIT;
  serving_per_package: number;
  per_serving: Nutrition<string>;
  per_hundred: Nutrition<string>;
}
