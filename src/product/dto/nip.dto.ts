import Big, { BigSource } from 'big.js';
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

export enum UNITS {
  energy = SERVING_UNIT.KCAL,
  protein = SERVING_UNIT.G,
  total_fat = SERVING_UNIT.G,
  saturated_fat = SERVING_UNIT.G,
  trans_fat = SERVING_UNIT.G,
  cholesterol = SERVING_UNIT.MG,
  carbohydrate = SERVING_UNIT.G,
  sugars = SERVING_UNIT.G,
  dietary_fibre = SERVING_UNIT.G,
  sodium = SERVING_UNIT.MG,
}

export interface NutritionQuantity {
  nutrition: Nutrition;
  quantity: number;
}

export class Nutrition {
  energy: BigSource = '0';
  protein: BigSource = '0';
  total_fat: BigSource = '0';
  saturated_fat: BigSource = '0';
  trans_fat: BigSource = '0';
  cholesterol: BigSource = '0';
  carbohydrate: BigSource = '0';
  sugars: BigSource = '0';
  dietary_fibre: BigSource = '0';
  sodium: BigSource = '0';

  copy(): Nutrition {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  add(other: Nutrition, quantityOfInput: number = 1): Nutrition {
    for (const field in this) {
      const sField = field as string;
      this[sField] = Big(this[sField]).add(
        Big(other[sField]).times(quantityOfInput),
      );
    }
    return this;
  }

  divide(divider: BigSource) {
    for (const field in this) {
      const sField = field as string;
      this[sField] = Big(this[sField]).div(divider);
    }
    return this;
  }

  times(multiplier: BigSource) {
    for (const field in this) {
      const sField = field as string;
      this[sField] = Big(this[sField]).times(multiplier);
    }
    return this;
  }

  stringify(): Nutrition {
    for (const field in this) {
      const sField = field as string;
      this[sField] = Big(this[sField]).toFixed(NUMBER_OF_DP[sField]);
    }
    return this;
  }

  stringifyAndAppendUnits(): Nutrition {
    this.stringify();
    for (const field in this) {
      const sField = field as string;
      this[sField] = `${this[sField]}${UNITS[sField]}`;
    }
    return this;
  }
}

export class NipDto {
  name: string;
  serving_size: number;
  serving_unit: SERVING_UNIT;
  serving_per_package: number;
  per_serving: Nutrition;
  per_hundred: Nutrition;
}
