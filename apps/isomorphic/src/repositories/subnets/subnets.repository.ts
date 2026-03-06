import { apiClient } from "../client";
import type {
  SubnetTimelineResponse,
  SubnetTimelineQueryParams,
} from "./subnets.types";

class SubnetsRepository {
  private readonly baseEndpoint = "/api/v1/subnets";

  async getSubnetTimeline(
    subnetId: string,
    params?: SubnetTimelineQueryParams
  ): Promise<SubnetTimelineResponse> {
    const response = await apiClient.get<SubnetTimelineResponse>(
      `${this.baseEndpoint}/${encodeURIComponent(subnetId)}/timeline`,
      params
    );

    return response.data;
  }
}

export const subnetsRepository = new SubnetsRepository();
