import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }): Promise<Order> {
    const orderNumber = `PED-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let totalAmount = 0;

    const orderItems: Partial<OrderItem>[] = [];

    for (const item of data.items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (product) {
        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }
    }

    const order = this.orderRepository.create({
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      notes: data.notes,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of orderItems) {
      const entity = this.itemRepository.create({
        ...item,
        orderId: savedOrder.id,
      });
      await this.itemRepository.save(entity);
    }

    return this.findByOrderNumber(orderNumber);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'items.product', 'items.product.workshop'],
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.orderRepository.update(id, { status });
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }
}
