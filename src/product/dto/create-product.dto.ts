import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { SERVING_UNIT } from '../entities/product.entity';
import { Type } from 'class-transformer';

export class MaterialIdAndQuantity {
  @IsNumber()
  material_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class SubProductIdAndQuantity {
  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  serving_size: number;

  @IsEnum(SERVING_UNIT)
  @IsNotEmpty()
  serving_unit: SERVING_UNIT;

  @IsNumber()
  @IsNotEmpty()
  serving_per_package: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaterialIdAndQuantity)
  material_id_and_quantity?: MaterialIdAndQuantity[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubProductIdAndQuantity)
  sub_product_id_and_quantity?: SubProductIdAndQuantity[];
}
