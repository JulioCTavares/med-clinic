import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { Role } from '@/core/domain/enums/role.enum';
import { AdminCreationRestrictedError } from '@/core/application/errors/application.error';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { users } from '@/infrastructure/database/drizzle/schemas';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    if (user.role === Role.ADMIN) {
      throw new AdminCreationRestrictedError();
    }

    const [row] = await this.db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .returning();

    return this.toEntity(row);
  }

  private toEntity(row: typeof users.$inferSelect): UserEntity {
    return UserEntity.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as Role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
