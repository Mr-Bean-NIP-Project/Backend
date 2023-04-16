import { Module, forwardRef } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    forwardRef(() => SupplierModule),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
