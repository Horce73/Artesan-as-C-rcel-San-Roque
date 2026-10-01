import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { Workshop } from './workshop.entity';
import { Artisan } from './artisan.entity';
import { InventoryBatch } from './inventory-batch.entity';

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD_OUT = 'SOLD_OUT',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  workshopId: string;

  @ManyToOne(() => Workshop, (w) => w.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @Column({ nullable: true })
  artisanId: string;

  @ManyToOne(() => Artisan, (a) => a.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'artisanId' })
  artisan: Artisan;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ unique: true })
  sku: string;

  @Column('simple-json', { nullable: true })
  imageUrls: string[];

  @Column({ default: 1 })
  stock: number;

  @Column({ type: 'varchar', default: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @Column({ default: true })
  isUniquePiece: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => InventoryBatch, (b) => b.product)
  batches: InventoryBatch[];
}
