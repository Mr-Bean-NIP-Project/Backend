import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Material } from '../../material/entities/material.entity';
import { Product } from './product.entity';

@Entity()
@Index(['material', 'product'], { unique: true })
export class MaterialProduct {
  @PrimaryColumn()
  material_id: number;

  @PrimaryColumn()
  product_id: number;

  @Column()
  material_quantity: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Material, (material) => material.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ManyToOne(() => Product, (prod) => prod.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
