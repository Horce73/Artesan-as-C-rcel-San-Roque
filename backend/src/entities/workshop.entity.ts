import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Artisan } from './artisan.entity';
import { Product } from './product.entity';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g. CARP, TALAB, TEJ, PINT

  @Column()
  name: string; // e.g. Taller de Carpintería y Ebanistería

  @Column('text')
  description: string;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Artisan, (artisan) => artisan.workshop)
  artisans: Artisan[];

  @OneToMany(() => Product, (product) => product.workshop)
  products: Product[];
}
