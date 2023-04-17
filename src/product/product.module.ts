import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MaterialModule } from '../material/material.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), MaterialModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
