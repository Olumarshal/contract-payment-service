import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';

export enum ContractStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  TERMINATED = 'terminated',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column('text')
  terms: string;

  @Column({ type: 'enum', enum: ContractStatus })
  status: ContractStatus;

  @ManyToOne(() => Profile, { nullable: false })
  contractor: Profile;

  @ManyToOne(() => Profile, { nullable: false })
  client: Profile;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
