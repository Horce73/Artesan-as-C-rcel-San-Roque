import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Workshop } from './workshop.entity';
import { Product } from './product.entity';

@Entity('artisans')
export class Artisan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workshopId: string;

  @ManyToOne(() => Workshop, (w) => w.artisans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @Column()
  aliasCode: string; // e.g. "Maestro Don Jorge - Carpintería"

  @Column('text')
  bioImpactStory: string; // Human narrative on social reintegration and craftsmanship

  @Column({ default: 1 })
  yearsInWorkshop: number;

  @OneToMany(() => Product, (p) => p.artisan)
  products: Product[];
}
