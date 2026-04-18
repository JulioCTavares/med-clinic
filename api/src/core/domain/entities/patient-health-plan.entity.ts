interface PatientHealthPlanEntityProps {
  patientId: string;
  healthPlanId: string;
  contractNumber: string;
}

export class PatientHealthPlanEntity {
  readonly patientId: string;
  readonly healthPlanId: string;
  readonly contractNumber: string;

  private constructor(props: PatientHealthPlanEntityProps) {
    this.patientId = props.patientId;
    this.healthPlanId = props.healthPlanId;
    this.contractNumber = props.contractNumber;
  }

  static create(props: PatientHealthPlanEntityProps): PatientHealthPlanEntity {
    return new PatientHealthPlanEntity(props);
  }
}
