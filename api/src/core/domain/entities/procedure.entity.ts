import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';

interface ProcedureEntityProps extends BaseEntityProps {
  code: string;
  name: string;
  value: string;
  deletedAt?: Date | null;
}

export class ProcedureEntity extends BaseEntity {
  readonly code: string;
  readonly name: string;
  readonly value: string;
  readonly deletedAt: Date | null;

  private constructor(props: ProcedureEntityProps) {
    super(props);
    this.code = props.code;
    this.name = props.name;
    this.value = props.value;
    this.deletedAt = props.deletedAt ?? null;
  }

  static create(props: ProcedureEntityProps): ProcedureEntity {
    return new ProcedureEntity(props);
  }

  static builder(): ProcedureEntityBuilder {
    return new ProcedureEntityBuilder();
  }
}

export class ProcedureEntityBuilder {
  private readonly props: Partial<ProcedureEntityProps> = {};

  id(id: string): this { this.props.id = id; return this; }
  code(code: string): this { this.props.code = code; return this; }
  name(name: string): this { this.props.name = name; return this; }
  value(value: string): this { this.props.value = value; return this; }
  createdAt(createdAt: Date): this { this.props.createdAt = createdAt; return this; }
  updatedAt(updatedAt: Date): this { this.props.updatedAt = updatedAt; return this; }
  deletedAt(deletedAt: Date | null): this { this.props.deletedAt = deletedAt; return this; }

  build(): ProcedureEntity {
    const now = new Date();
    return ProcedureEntity.create({
      id: this.props.id!,
      code: this.props.code!,
      name: this.props.name!,
      value: this.props.value!,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
      deletedAt: this.props.deletedAt ?? null,
    });
  }
}
