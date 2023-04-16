import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import { Supplier } from './entities/supplier.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

describe('SupplierService', () => {
  let service: SupplierService;

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
      providers: [SupplierService],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
