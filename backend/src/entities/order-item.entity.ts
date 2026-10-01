import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
}
