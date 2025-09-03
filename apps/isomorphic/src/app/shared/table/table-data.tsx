// src/app/shared/table/table-data.ts
export type ValidatorKey = `validator_${number}`; // p. ej. "validator_71"

export interface TableDataType {
  miner_uid: number;
  miner_hotkey: string;

  /** 0-many pares "validator_X": puntuación */
  scores_per_validator: Partial<Record<ValidatorKey, number>>;

  /** 0-many pares "validator_X": duración */
  durations_per_validator: Partial<Record<ValidatorKey, number>>;

  score_avg: number;
  duration_avg: number;
}
