import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialProduct } from './material_product.entity';
import { ProductSubProduct } from './product_sub_product.entity';

export enum SERVING_UNIT {
  G = 'g',
  ML = 'ml',
  MG = 'mg',
  KCAL = 'kcal',
}

@Entity()
@Unique(['name'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  serving_size: number;

  @Column({
    type: 'simple-enum',
    enum: SERVING_UNIT,
  })
  serving_unit: SERVING_UNIT;

  @Column()
  serving_per_package: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProductSubProduct, (psp) => psp.parent)
  @JoinTable({ joinColumn: { name: 'parent_id' } })
  product_sub_products: ProductSubProduct[];

  @OneToMany(() => MaterialProduct, (mp) => mp.product)
  @JoinColumn({ name: 'product_id' })
  material_product: MaterialProduct[];

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  initializeArrays() {
    // we wanna init arrays as empty array if nothing is tagged to it
    if (!this.product_sub_products) this.product_sub_products = [];
    if (!this.material_product) this.material_product = [];
    return this;
  }

  emptySubProductAndMaterialProduct() {
    this.material_product = [];
    this.product_sub_products = [];
    return this;
  }
}
