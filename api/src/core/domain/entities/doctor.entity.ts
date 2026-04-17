import { randomUUID } from 'node:crypto';
import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';

interface DoctorEntityProps extends BaseEntityProps {
  userId: string;
  name: string;
  crm: string;
  specialtyId: string;
}

export class DoctorEntity extends BaseEntity {
  readonly userId: string;
  readonly name: string;
  readonly crm: string;
  readonly specialtyId: string;

  private constructor(props: DoctorEntityProps) {
    super(props);
    this.userId = props.userId;
    this.name = props.name;
    this.crm = props.crm;
    this.specialtyId = props.specialtyId;
  }

  static create(props: DoctorEntityProps): DoctorEntity {
    return new DoctorEntity(props);
  }

  static builder(): DoctorEntityBuilder {
    return new DoctorEntityBuilder();
  }
}

export class DoctorEntityBuilder {
  private readonly props: Partial<DoctorEntityProps> = {};

  id(id: string): this {
    this.props.id = id;
    return this;
  }

  userId(userId: string): this {
    this.props.userId = userId;
    return this;
  }

  name(name: string): this {
    this.props.name = name;
    return this;
  }

  crm(crm: string): this {
    this.props.crm = crm;
    return this;
  }

  specialtyId(specialtyId: string): this {
    this.props.specialtyId = specialtyId;
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

  build(): DoctorEntity {
    const now = new Date();
    return DoctorEntity.create({
      id: this.props.id ?? randomUUID(),
      userId: this.props.userId!,
      name: this.props.name!,
      crm: this.props.crm!,
      specialtyId: this.props.specialtyId!,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
    });
  }
}
