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
import { Product } from './product.entity';

const CHILD_ID: string = 'child_id';
const PARENT_ID: string = 'parent_id';

@Entity()
@Index([CHILD_ID, PARENT_ID], { unique: true })
export class ProductSubProduct {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  parent_id?: number;

  @Column()
  child_id?: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @ManyToOne(() => Product, (prod) => prod.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: PARENT_ID })
  parent?: Product;

  @ManyToOne(() => Product, (prod) => prod.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: CHILD_ID })
  child?: Product;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  initializeArrays() {
    // we wanna init arrays as empty array if nothing is tagged to it
    if (this.child) {
      if (!this.child.material_product) this.child.material_product = [];
      if (!this.child.product_sub_products)
        this.child.product_sub_products = [];
    }
    if (this.parent) {
      if (!this.parent.material_product) this.parent.material_product = [];
      if (!this.parent.product_sub_products)
        this.parent.product_sub_products = [];
    }

    return this;
  }

  emptyNested() {
    delete this.parent; // this is repeated info
    this.child.material_product = []; // nested child don't bother with material_product
    this.child.product_sub_products = []; // dont care about grandchildren products
    return this;
  }
}
