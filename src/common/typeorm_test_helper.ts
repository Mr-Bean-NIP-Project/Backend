import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Material } from '../material/entities/material.entity';
import { MaterialProduct } from '../product/entities/material_product.entity';
import { Product } from '../product/entities/product.entity';

export function TYPEORM_TEST_IMPORTS() {
  const dataSourceOptions: DataSourceOptions = {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Supplier, Material, MaterialProduct, Product],
    synchronize: true,
  };

  return [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Supplier, Material, MaterialProduct, Product]),
  ];
}
