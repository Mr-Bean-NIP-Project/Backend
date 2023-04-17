import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MaterialModule } from '../material/material.module';
import { MaterialProduct } from './entities/material_product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, MaterialProduct]), MaterialModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
