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

export interface NutritionQuantity {
  nutrition: Nutrition;
  quantity: number;
}

export class Nutrition {
  energy: BigSource;
  protein: BigSource;
  total_fat: BigSource;
  saturated_fat: BigSource;
  trans_fat: BigSource;
  cholesterol: BigSource;
  carbohydrate: BigSource;
  sugars: BigSource;
  dietary_fibre: BigSource;
  sodium: BigSource;

  static staticCopy(other: Nutrition): Nutrition {
    return Object.assign(Object.create(Object.getPrototypeOf(other)), other);
  }

  copy(): Nutrition {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  addOtherNutrition(other: Nutrition, quantityOfInput: number = 1): Nutrition {
    this.energy = Big(this.energy).add(Big(other.energy).times(quantityOfInput));
    this.protein = Big(this.protein).add(Big(other.protein).times(quantityOfInput));
    this.total_fat = Big(this.total_fat).add(Big(other.total_fat).times(quantityOfInput));
    this.saturated_fat = Big(this.saturated_fat).add(Big(other.saturated_fat).times(quantityOfInput));
    this.trans_fat = Big(this.trans_fat).add(Big(other.trans_fat).times(quantityOfInput));
    this.cholesterol = Big(this.cholesterol).add(Big(other.cholesterol).times(quantityOfInput));
    this.carbohydrate = Big(this.carbohydrate).add(Big(other.carbohydrate).times(quantityOfInput));
    this.sugars = Big(this.sugars).add(Big(other.sugars).times(quantityOfInput));
    this.dietary_fibre = Big(this.dietary_fibre).add(Big(other.dietary_fibre).times(quantityOfInput));
    this.sodium = Big(this.sodium).add(Big(other.sodium).times(quantityOfInput));
    return this;
  }

  divide(divider: BigSource) {
    this.energy = Big(this.energy).div(Big(divider));
    this.protein = Big(this.protein).div(Big(divider));
    this.total_fat = Big(this.total_fat).div(Big(divider));
    this.saturated_fat = Big(this.saturated_fat).div(Big(divider));
    this.trans_fat = Big(this.trans_fat).div(Big(divider));
    this.cholesterol = Big(this.cholesterol).div(Big(divider));
    this.carbohydrate = Big(this.carbohydrate).div(Big(divider));
    this.sugars = Big(this.sugars).div(Big(divider));
    this.dietary_fibre = Big(this.dietary_fibre).div(Big(divider));
    this.sodium = Big(this.sodium).div(Big(divider));
    return this;
  }

  times(multiplier: BigSource) {
    this.energy = Big(this.energy).times(Big(multiplier));
    this.protein = Big(this.protein).times(Big(multiplier));
    this.total_fat = Big(this.total_fat).times(Big(multiplier));
    this.saturated_fat = Big(this.saturated_fat).times(Big(multiplier));
    this.trans_fat = Big(this.trans_fat).times(Big(multiplier));
    this.cholesterol = Big(this.cholesterol).times(Big(multiplier));
    this.carbohydrate = Big(this.carbohydrate).times(Big(multiplier));
    this.sugars = Big(this.sugars).times(Big(multiplier));
    this.dietary_fibre = Big(this.dietary_fibre).times(Big(multiplier));
    this.sodium = Big(this.sodium).times(Big(multiplier));
    return this;
  }


  toString(): Nutrition {
    this.energy = Big(this.energy).toFixed(NUMBER_OF_DP.energy);
    this.protein = Big(this.protein).toFixed(NUMBER_OF_DP.protein);
    this.total_fat = Big(this.total_fat).toFixed(NUMBER_OF_DP.total_fat);
    this.saturated_fat = Big(this.saturated_fat).toFixed(NUMBER_OF_DP.saturated_fat);
    this.trans_fat = Big(this.trans_fat).toFixed(NUMBER_OF_DP.trans_fat);
    this.cholesterol = Big(this.cholesterol).toFixed(NUMBER_OF_DP.cholesterol);
    this.carbohydrate = Big(this.carbohydrate).toFixed(NUMBER_OF_DP.carbohydrate);
    this.sugars = Big(this.sugars).toFixed(NUMBER_OF_DP.sugars);
    this.dietary_fibre = Big(this.dietary_fibre).toFixed(NUMBER_OF_DP.dietary_fibre);
    this.sodium = Big(this.sodium).toFixed(NUMBER_OF_DP.sodium);
    return this;
  }
}

export function GET_EMPTY_NUTRITION(): Nutrition {
  const n: Nutrition = new Nutrition();
  n.energy = Number(0).toFixed(NUMBER_OF_DP.energy);
  n.protein = Number(0).toFixed(NUMBER_OF_DP.protein);
  n.total_fat = Number(0).toFixed(NUMBER_OF_DP.total_fat);
  n.saturated_fat = Number(0).toFixed(NUMBER_OF_DP.saturated_fat);
  n.trans_fat = Number(0).toFixed(NUMBER_OF_DP.trans_fat);
  n.cholesterol = Number(0).toFixed(NUMBER_OF_DP.cholesterol);
  n.carbohydrate = Number(0).toFixed(NUMBER_OF_DP.carbohydrate);
  n.sugars = Number(0).toFixed(NUMBER_OF_DP.sugars);
  n.dietary_fibre = Number(0).toFixed(NUMBER_OF_DP.dietary_fibre);
  n.sodium = Number(0).toFixed(NUMBER_OF_DP.sodium);
  return n;
}

export class NipDto {
  name: string;
  serving_size: number;
  serving_unit: SERVING_UNIT;
  serving_per_package: number;
  per_serving: Nutrition;
  per_hundred: Nutrition;
}
