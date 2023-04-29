import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MaterialModule } from '../material/material.module';
import { MaterialProduct } from './entities/material_product.entity';
import { ProductSubProduct } from './entities/product_sub_product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, MaterialProduct, ProductSubProduct]),
    MaterialModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
