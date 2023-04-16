import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumberString()
  @IsOptional()
  energy?: string;

  @IsNumberString()
  @IsOptional()
  protein?: string;

  @IsNumberString()
  @IsOptional()
  total_fat?: string;

  @IsNumberString()
  @IsOptional()
  saturated_fat?: string;

  @IsNumberString()
  @IsOptional()
  trans_fat?: string;

  @IsNumberString()
  @IsOptional()
  cholesterol?: string;

  @IsNumberString()
  @IsOptional()
  carbohydrate?: string;

  @IsNumberString()
  @IsOptional()
  sugars?: string;

  @IsNumberString()
  @IsOptional()
  dietary_fibre?: string;

  @IsNumberString()
  @IsOptional()
  sodium?: string;

  @IsNumber()
  supplier_id: number;
}
