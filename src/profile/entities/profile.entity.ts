import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProfileRole {
  CLIENT = 'client',
  CONTRACTOR = 'contractor',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  profession: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'enum', enum: ProfileRole })
  role: ProfileRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
