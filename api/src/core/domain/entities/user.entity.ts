import { randomUUID } from 'node:crypto';
import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';
import { Role } from '@/core/domain/enums/role.enum';

interface UserEntityProps extends BaseEntityProps {
  email: string;
  passwordHash: string;
  role: Role;
}

export class UserEntity extends BaseEntity {
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;

  private constructor(props: UserEntityProps) {
    super(props);
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
  }

  static create(props: UserEntityProps): UserEntity {
    return new UserEntity(props);
  }

  static builder(): UserEntityBuilder {
    return new UserEntityBuilder();
  }
}

export class UserEntityBuilder {
  private readonly props: Partial<UserEntityProps> = {};

  id(id: string): this {
    this.props.id = id;
    return this;
  }

  email(email: string): this {
    this.props.email = email;
    return this;
  }

  passwordHash(passwordHash: string): this {
    this.props.passwordHash = passwordHash;
    return this;
  }

  role(role: Role): this {
    this.props.role = role;
    return this;
  }

  createdAt(createdAt: Date): this {
    this.props.createdAt = createdAt;
    return this;
  }

  updatedAt(updatedAt: Date): this {
    this.props.updatedAt = updatedAt;
    return this;
  }

  build(): UserEntity {
    const now = new Date();
    return UserEntity.create({
      id: this.props.id ?? randomUUID(),
      email: this.props.email!,
      passwordHash: this.props.passwordHash!,
      role: this.props.role!,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
    });
  }
}
