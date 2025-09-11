import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'nickname' })
  nickname: string;

  @Column('varchar', { name: 'email' })
  email: string;

  @Column('varchar', { name: 'username' })
  username: string;

  @Column('varchar', { name: 'password', select: false })
  password: string;

  @Column('date', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('date', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
