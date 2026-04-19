import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';

interface HealthPlanEntityProps extends BaseEntityProps {
  code: string;
  description: string;
  phone?: string | null;
  deletedAt?: Date | null;
}

export class HealthPlanEntity extends BaseEntity {
  readonly code: string;
  readonly description: string;
  readonly phone: string | null;
  readonly deletedAt: Date | null;

  private constructor(props: HealthPlanEntityProps) {
    super(props);
    this.code = props.code;
    this.description = props.description;
    this.phone = props.phone ?? null;
    this.deletedAt = props.deletedAt ?? null;
  }

  static create(props: HealthPlanEntityProps): HealthPlanEntity {
    return new HealthPlanEntity(props);
  }

  static builder(): HealthPlanEntityBuilder {
    return new HealthPlanEntityBuilder();
  }
}

export class HealthPlanEntityBuilder {
  private readonly props: Partial<HealthPlanEntityProps> = {};

  id(id: string): this { this.props.id = id; return this; }
  code(code: string): this { this.props.code = code; return this; }
  description(description: string): this { this.props.description = description; return this; }
  phone(phone: string | null): this { this.props.phone = phone; return this; }
  createdAt(createdAt: Date): this { this.props.createdAt = createdAt; return this; }
  updatedAt(updatedAt: Date): this { this.props.updatedAt = updatedAt; return this; }
  deletedAt(deletedAt: Date | null): this { this.props.deletedAt = deletedAt; return this; }

  build(): HealthPlanEntity {
    const now = new Date();
    return HealthPlanEntity.create({
      id: this.props.id!,
      code: this.props.code!,
      description: this.props.description!,
      phone: this.props.phone ?? null,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
      deletedAt: this.props.deletedAt ?? null,
    });
  }
}
