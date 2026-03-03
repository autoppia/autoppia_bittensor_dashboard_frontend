/**
 * Validators API Service
 * Handles all API calls related to validators
 */

import { apiClient } from "../client";
import type { ValidatorDetailsResponse, ValidatorDetailsData } from "./validators.types";

export class ValidatorsRepository {
  private readonly baseEndpoint = "/api/v1/validators";

  /**
   * Get detailed statistics for a validator
   * @param uid Validator UID
   * @param round Optional round number to filter evaluations
   */
  async getValidatorDetails(uid: number, round?: string | null): Promise<ValidatorDetailsData> {
    const params = round !== null && round !== undefined ? { round } : undefined;
    const response = await apiClient.get<ValidatorDetailsResponse>(
      `${this.baseEndpoint}/${uid}/details`,
      params
    );
    return response.data.data;
  }
}

export const validatorsRepository = new ValidatorsRepository();
