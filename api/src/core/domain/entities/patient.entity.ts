import { randomUUID } from 'node:crypto';
import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';

interface PatientEntityProps extends BaseEntityProps {
  userId: string;
  name: string;
  birthDate?: string;
  phones?: string[];
}

export class PatientEntity extends BaseEntity {
  readonly userId: string;
  readonly name: string;
  readonly birthDate?: string;
  readonly phones?: string[];

  private constructor(props: PatientEntityProps) {
    super(props);
    this.userId = props.userId;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.phones = props.phones;
  }

  static create(props: PatientEntityProps): PatientEntity {
    return new PatientEntity(props);
  }

  static builder(): PatientEntityBuilder {
    return new PatientEntityBuilder();
  }
}

export class PatientEntityBuilder {
  private readonly props: Partial<PatientEntityProps> = {};

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

  birthDate(birthDate: string): this {
    this.props.birthDate = birthDate;
    return this;
  }

  phones(phones: string[]): this {
    this.props.phones = phones;
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

  build(): PatientEntity {
    const now = new Date();
    return PatientEntity.create({
      id: this.props.id ?? randomUUID(),
      userId: this.props.userId!,
      name: this.props.name!,
      birthDate: this.props.birthDate,
      phones: this.props.phones,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
    });
  }
}
