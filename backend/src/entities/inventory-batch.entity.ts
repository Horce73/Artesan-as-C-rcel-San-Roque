import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { TraceabilityEvent } from './traceability-event.entity';

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (p) => p.batches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ unique: true })
  trackingCode: string; // e.g., SR-CARP-2026-001

  @Column({ default: 1 })
  stockQuantity: number;

  @Column({ default: 'EN_PROCESO' })
  batchStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TraceabilityEvent, (e) => e.batch, { cascade: true })
  events: TraceabilityEvent[];
}
