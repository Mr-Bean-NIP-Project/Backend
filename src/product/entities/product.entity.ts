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

  @OneToMany(() => Product, (product) => product.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_product_ids', referencedColumnName: 'id' })
  sub_products: Product[];

  @Column('simple-array', {
    array: true,
    transformer: {
      to(value) {
        // do nothing, lave it to typeorm
        return value;
      },
      from(value) {
        // cast from string[] to number[]
        return value.map((val) => +val);
      },
    },
  })
  sub_product_ids: number[];

  @ManyToMany(() => Material, (material) => material.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  materials: Material[];

  @Column('simple-array', {
    array: true,
    transformer: {
      to(value) {
        // do nothing, lave it to typeorm
        return value;
      },
      from(value) {
        // cast from string[] to number[]
        return value.map((val) => +val);
      },
    },
  })
  material_ids: number[];
}
