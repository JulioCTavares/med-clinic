import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';

interface SpecialtyEntityProps extends BaseEntityProps {
  code: string;
  name: string;
  deletedAt?: Date | null;
}

export class SpecialtyEntity extends BaseEntity {
  readonly code: string;
  readonly name: string;
  readonly deletedAt: Date | null;

  private constructor(props: SpecialtyEntityProps) {
    super(props);
    this.code = props.code;
    this.name = props.name;
    this.deletedAt = props.deletedAt ?? null;
  }

  static create(props: SpecialtyEntityProps): SpecialtyEntity {
    return new SpecialtyEntity(props);
  }

  static builder(): SpecialtyEntityBuilder {
    return new SpecialtyEntityBuilder();
  }
}

export class SpecialtyEntityBuilder {
  private readonly props: Partial<SpecialtyEntityProps> = {};

  id(id: string): this { this.props.id = id; return this; }
  code(code: string): this { this.props.code = code; return this; }
  name(name: string): this { this.props.name = name; return this; }
  createdAt(createdAt: Date): this { this.props.createdAt = createdAt; return this; }
  updatedAt(updatedAt: Date): this { this.props.updatedAt = updatedAt; return this; }
  deletedAt(deletedAt: Date | null): this { this.props.deletedAt = deletedAt; return this; }

  build(): SpecialtyEntity {
    const now = new Date();
    return SpecialtyEntity.create({
      id: this.props.id!,
      code: this.props.code!,
      name: this.props.name!,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
      deletedAt: this.props.deletedAt ?? null,
    });
  }
}
