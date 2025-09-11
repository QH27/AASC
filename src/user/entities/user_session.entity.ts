import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import type { TokenPayload } from 'src/user/guard/auth.guard';

@Entity({ name: 'user_session' })
export class UserSession {
  @PrimaryColumn('text')
  id: string;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({ name: 'expire_time', type: 'int', nullable: true })
  expireTime: number;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken?: string;

  @Column('text', { name: 'token_payload', nullable: true })
  tokenPayload?: TokenPayload;

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

  constructor(partial: Partial<UserSession>) {
    Object.assign(this, partial);
  }
}
