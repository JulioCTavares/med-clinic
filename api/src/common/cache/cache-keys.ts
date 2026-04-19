export const CacheKeys = {
  medico:               (id: string)  => `medico:${id}`,
  medicoList:           ()            => 'medico:list',
  especialidade:        (id: string)  => `especialidade:${id}`,
  especialidadeList:    ()            => 'especialidade:list',
  procedimento:         (id: string)  => `procedimento:${id}`,
  procedimentoList:     ()            => 'procedimento:list',
  plano:                (id: string)  => `plano:${id}`,
  planoList:            ()            => 'plano:list',
  blacklist:            (jti: string) => `blacklist:${jti}`,
} as const;
