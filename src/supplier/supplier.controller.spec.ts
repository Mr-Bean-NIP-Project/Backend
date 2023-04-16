import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierModule } from './supplier.module';
import { Supplier } from './entities/supplier.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('SupplierController', () => {
  let controller: SupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Supplier],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Supplier]),
      ],
      controllers: [SupplierController],
      providers: [SupplierService],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
