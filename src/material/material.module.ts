import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [TypeOrmModule.forFeature([Material]), SupplierModule],
  controllers: [MaterialController],
  providers: [MaterialService]
})
export class MaterialModule {}
