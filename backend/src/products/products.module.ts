import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, InventoryBatch])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
