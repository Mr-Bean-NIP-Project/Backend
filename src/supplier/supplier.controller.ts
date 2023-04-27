import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Transactional } from 'typeorm-transactional';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Transactional()
  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Get()
  async findAll() {
    return await this.supplierService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.supplierService.findOne(+id);
  }

  @Transactional()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return await this.supplierService.update(+id, updateSupplierDto);
  }

  @Transactional()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.supplierService.remove(+id);
  }
}
