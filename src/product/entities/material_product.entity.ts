import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Material } from '../../material/entities/material.entity';
import { Product } from './product.entity';

const MATERIAL_ID: string = 'material_id';
const PRODUCT_ID: string = 'product_id';

@Entity()
@Index([MATERIAL_ID, PRODUCT_ID], { unique: true })
export class MaterialProduct {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  material_id?: number;

  @Column()
  product_id?: number;

  @Column()
  material_quantity: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @ManyToOne(() => Material, (material) => material.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: MATERIAL_ID })
  material?: Material;

  @ManyToOne(() => Product, (prod) => prod.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: PRODUCT_ID })
  product?: Product;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  initializeArrays() {
    // we wanna init arrays as empty array if nothing is tagged to it
    if (this.product) {
      if (!this.product.materials) this.product.materials = [];
      if (!this.product.sub_products) this.product.sub_products = [];
    }

    return this;
  }

  emptyNested() {
    // for material products, we don't need to care about their
    // corresponding product/material tags. We just want
    // their details
    delete this.product; // this is repeated info

    return this;
  }
}
