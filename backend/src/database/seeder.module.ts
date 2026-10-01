import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Artisan } from '../entities/artisan.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { TraceabilityEvent } from '../entities/traceability-event.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workshop,
      Artisan,
      Category,
      Product,
      InventoryBatch,
      TraceabilityEvent,
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
