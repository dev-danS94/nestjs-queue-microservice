import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ExampleStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('examples')
export class ExampleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exampleId: string;

  @Column('text')
  payload: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: ExampleStatus;

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
