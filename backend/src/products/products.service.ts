import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
  ) {}

  async findAll(query?: { categoryId?: string; workshopId?: string; search?: string }): Promise<Product[]> {
    const where: any = {};
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.workshopId) where.workshopId = query.workshopId;
    if (query?.search) where.title = ILike(`%${query.search}%`);

    return this.productRepository.find({
      where,
      relations: ['category', 'workshop', 'artisan', 'batches'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'workshop', 'artisan', 'batches', 'batches.events'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    const savedProduct = await this.productRepository.save(product);

    // Auto-create a default inventory batch & tracking code if none provided
    const trackingCode = `SR-${data.sku || 'ART'}-${Date.now().toString().slice(-4)}`;
    const batch = this.batchRepository.create({
      productId: savedProduct.id,
      trackingCode,
      stockQuantity: savedProduct.stock || 1,
      batchStatus: 'LISTO_CATALOGO',
    });
    await this.batchRepository.save(batch);

    return this.findOne(savedProduct.id);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
