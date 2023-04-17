import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
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
    eager: true,
  })
  @JoinColumn({ name: PRODUCT_ID })
  product?: Product;
}
