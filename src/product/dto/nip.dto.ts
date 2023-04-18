import { SERVING_UNIT } from '../entities/product.entity';

export interface Nutrition {
  energy: string;
  protein: string;
  total_fat: string;
  saturated_fat: string;
  trans_fat: string;
  cholesterol: string;
  carbohydrate: string;
  sugars: string;
  dietary_fibre: string;
  sodium: string;
}

export class NipDto {
  name: string;
  serving_size: number;
  serving_unit: SERVING_UNIT;
  serving_per_package: number;
  per_serving: Nutrition;
  per_hundred: Nutrition;
}
