import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title' })
  title: string;

  @Column('varchar', { name: 'description' })
  description: string;

  @Column('int', { name: 'status', default: TaskStatus.TODO })
  status: number;

  @Column('date', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
