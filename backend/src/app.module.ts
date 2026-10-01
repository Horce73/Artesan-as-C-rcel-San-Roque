import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { User } from './entities/user.entity';
import { Workshop } from './entities/workshop.entity';
import { Artisan } from './entities/artisan.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { TraceabilityEvent } from './entities/traceability-event.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

import { AuthModule } from './auth/auth.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { ArtisansModule } from './artisans/artisans.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { TraceabilityModule } from './traceability/traceability.module';
import { OrdersModule } from './orders/orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { SeederModule } from './database/seeder.module';

const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'sanroque_user',
      password: process.env.POSTGRES_PASSWORD || 'sanroque_pass_2026',
      database: process.env.POSTGRES_DB || 'sanroque_db',
      entities: [
        User,
        Workshop,
        Artisan,
        Category,
        Product,
        InventoryBatch,
        TraceabilityEvent,
        Order,
        OrderItem,
      ],
      synchronize: true, // Auto-create schema tables for dev/production container
    }),
    ServeStaticModule.forRoot({
      rootPath: uploadsDir,
      serveRoot: '/uploads',
    }),
    AuthModule,
    WorkshopsModule,
    ArtisansModule,
    CategoriesModule,
    ProductsModule,
    TraceabilityModule,
    OrdersModule,
    UploadsModule,
    SeederModule,
  ],
})
export class AppModule {}
