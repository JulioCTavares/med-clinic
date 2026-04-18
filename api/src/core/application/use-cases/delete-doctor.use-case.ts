import { Inject, Injectable } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeleteDoctorUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.doctorRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('Doctor', id);
    await this.doctorRepository.softDelete(id);
  }
}
