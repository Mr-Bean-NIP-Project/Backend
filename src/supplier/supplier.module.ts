import { Module, forwardRef } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { MaterialModule } from '../material/material.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    forwardRef(() => MaterialModule),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
