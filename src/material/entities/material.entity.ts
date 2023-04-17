import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '0' }) // in kCal
  energy: string;

  @Column({ default: '0' }) // in g
  protein: string;

  @Column({ default: '0' }) // in g
  total_fat: string;

  @Column({ default: '0' }) // in g
  saturated_fat: string;

  @Column({ default: '0' }) // in g
  trans_fat: string;

  @Column({ default: '0' }) // in mg
  cholesterol: string;

  @Column({ default: '0' }) // in g
  carbohydrate: string;

  @Column({ default: '0' }) // in g
  sugars: string;

  @Column({ default: '0' }) // in g
  dietary_fibre: string;

  @Column({ default: '0' }) // in mg
  sodium: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Supplier, (supplier) => supplier.id, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn()
  supplier: Supplier;
}
