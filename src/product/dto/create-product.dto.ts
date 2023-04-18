import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SERVING_UNIT } from '../entities/product.entity';

export interface MaterialIdAndQuantity {
  material_id: number;
  quantity: number;
}

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
  @IsOptional()
  sub_product_ids?: number[];

  @IsArray()
  @IsOptional()
  material_id_and_quantity?: MaterialIdAndQuantity[];
}
