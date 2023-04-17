import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Material } from '../../material/entities/material.entity';
import { Transform } from 'class-transformer';

export enum SERVING_UNIT {
  G = 'g',
  ML = 'ml',
}

@Entity()
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

  @ManyToMany(() => Product, (product) => product.id, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinTable({ joinColumn: { name: 'product_id_1' } })
  sub_products: Product[];

  @ManyToMany(() => Material, (material) => material.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  materials: Material[];
}
