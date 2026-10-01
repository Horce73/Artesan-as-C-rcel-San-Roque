import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', default: UserRole.OPERATOR })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
