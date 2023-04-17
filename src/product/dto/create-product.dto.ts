import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min
} from 'class-validator';
import { SERVING_UNIT } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  serving_size: number;

  @IsEnum(SERVING_UNIT)
  @IsNotEmpty()
  serving_unit: SERVING_UNIT;

  @IsNumber()
  @IsNotEmpty()
  serving_per_package: number;

  @IsArray()
  sub_product_ids: number[] = [];

  @IsArray()
  material_ids: number[] = [];
}
