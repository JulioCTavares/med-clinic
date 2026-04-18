import { BaseEntity, BaseEntityProps } from '@/core/domain/entities/base.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

interface AppointmentEntityProps extends BaseEntityProps {
  code: string;
  date: string;
  time: string;
  isPrivate: boolean;
  status: AppointmentStatus;
  patientId: string;
  doctorId: string;
  deletedAt?: Date | null;
}

export class AppointmentEntity extends BaseEntity {
  readonly code: string;
  readonly date: string;
  readonly time: string;
  readonly isPrivate: boolean;
  readonly status: AppointmentStatus;
  readonly patientId: string;
  readonly doctorId: string;
  readonly deletedAt: Date | null;

  private constructor(props: AppointmentEntityProps) {
    super(props);
    this.code = props.code;
    this.date = props.date;
    this.time = props.time;
    this.isPrivate = props.isPrivate;
    this.status = props.status;
    this.patientId = props.patientId;
    this.doctorId = props.doctorId;
    this.deletedAt = props.deletedAt ?? null;
  }

  static create(props: AppointmentEntityProps): AppointmentEntity {
    return new AppointmentEntity(props);
  }

  static builder(): AppointmentEntityBuilder {
    return new AppointmentEntityBuilder();
  }
}

export class AppointmentEntityBuilder {
  private readonly props: Partial<AppointmentEntityProps> = {};

  id(id: string): this { this.props.id = id; return this; }
  code(code: string): this { this.props.code = code; return this; }
  date(date: string): this { this.props.date = date; return this; }
  time(time: string): this { this.props.time = time; return this; }
  isPrivate(isPrivate: boolean): this { this.props.isPrivate = isPrivate; return this; }
  status(status: AppointmentStatus): this { this.props.status = status; return this; }
  patientId(patientId: string): this { this.props.patientId = patientId; return this; }
  doctorId(doctorId: string): this { this.props.doctorId = doctorId; return this; }
  createdAt(createdAt: Date): this { this.props.createdAt = createdAt; return this; }
  updatedAt(updatedAt: Date): this { this.props.updatedAt = updatedAt; return this; }
  deletedAt(deletedAt: Date | null): this { this.props.deletedAt = deletedAt; return this; }

  build(): AppointmentEntity {
    const now = new Date();
    return AppointmentEntity.create({
      id: this.props.id!,
      code: this.props.code!,
      date: this.props.date!,
      time: this.props.time!,
      isPrivate: this.props.isPrivate ?? false,
      status: this.props.status ?? AppointmentStatus.PENDING,
      patientId: this.props.patientId!,
      doctorId: this.props.doctorId!,
      createdAt: this.props.createdAt ?? now,
      updatedAt: this.props.updatedAt ?? now,
      deletedAt: this.props.deletedAt ?? null,
    });
  }
}
