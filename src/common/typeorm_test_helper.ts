import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { Material } from '../material/entities/material.entity';
import { MaterialProduct } from '../product/entities/material_product.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

let addedTransactionalDataSourceBefore: boolean = false;

export function TYPEORM_TEST_IMPORTS() {
  const dataSourceOptions: DataSourceOptions = {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Supplier, Material, MaterialProduct, Product],
    synchronize: true,
  };

  return [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return dataSourceOptions;
      },
      async dataSourceFactory(options) {
        if (!addedTransactionalDataSourceBefore) {
          addedTransactionalDataSourceBefore = true;
          return addTransactionalDataSource(new DataSource(options));
        }
        return new DataSource(options);
      },
    }),
    TypeOrmModule.forFeature([Supplier, Material, MaterialProduct, Product]),
  ];
}
