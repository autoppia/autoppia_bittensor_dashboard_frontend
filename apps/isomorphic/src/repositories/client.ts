/**
 * Base API client for the AutoPPIA Bittensor Dashboard
 * Handles common API functionality like error handling, authentication, and request configuration
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiErrorShape {
  message: string;
  status: number;
  code?: string;
}

/** Error class for API failures (status, code); use for throw so stack traces work. */
export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const resolveBaseUrl = () => {
  const envBaseUrl =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeBaseUrl(process.env.API_BASE_URL) ||
    normalizeBaseUrl(process.env.API_URL);

  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Default to production API when no explicit base URL is configured.
  return "https://api-leaderboard.autoppia.com";
};

export class ApiClient {
  private readonly baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = resolveBaseUrl()) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      Accept: "application/json",
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();

    // Check if the API response indicates failure
    if (data && typeof data === "object" && data.success === false) {
      // Handle specific error cases
      if (data.code === "AGENT_RUN_NOT_FOUND") {
        throw new ApiError(
          data.error ||
            `Agent run with ID '${this.extractRunIdFromUrl(response.url)}' not found`,
          404,
          "AGENT_RUN_NOT_FOUND"
        );
      }

      throw new ApiError(
        data.error || data.message || "API request failed",
        response.status,
        data.code || "API_ERROR"
      );
    }

    return {
      data,
      success: true,
    };
  }

  private extractRunIdFromUrl(url: string): string {
    const match = /\/agent-runs\/([^/?]+)/.exec(url);
    return match ? match[1] : "unknown";
  }

  private async handleNetworkError<T>(
    endpoint: string
  ): Promise<ApiResponse<T>> {
    // Instead of using mock data, throw an error to trigger loading states
    console.warn(
      `Backend not available for ${endpoint}, will show loading state`
    );

    throw new ApiError(
      `Backend service unavailable for ${endpoint}`,
      503,
      "SERVICE_UNAVAILABLE"
    );
  }

  private async handleAgentRunNotFound<T>(
    endpoint: string,
    runId: string
  ): Promise<ApiResponse<T>> {
    // Handle specific case where agent run is not found
    console.warn(`Agent run ${runId} not found for ${endpoint}`);

    throw new ApiError(
      `Agent run '${runId}' not found. Please check the URL or try a different run ID.`,
      404,
      "AGENT_RUN_NOT_FOUND"
    );
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      // Use longer timeout for heavy endpoints (overview/metrics)
      const isHeavyEndpoint = endpoint.includes('/overview/metrics') ||
                               endpoint.includes('/overview/validators') ||
                               endpoint.includes('/leaderboard');
      const timeout = isHeavyEndpoint ? 30000 : 10000; // 30s for heavy endpoints, 10s for others
      const timeoutId = setTimeout(() => {
        console.warn(`[ApiClient] Request timeout after ${timeout/1000}s for:`, url.toString());
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: this.defaultHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return this.handleResponse<T>(response);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('[ApiClient] Fetch error:', fetchError);

        // Handle abort (timeout)
        if (fetchError?.name === 'AbortError') {
          console.error('[ApiClient] Request was aborted (timeout)');
          throw new ApiError(
            'Request timeout: The server did not respond in time',
            408,
            'TIMEOUT'
          );
        }

        // Handle network errors (connection refused, etc.)
        if (fetchError?.code === 'ECONNREFUSED' ||
            fetchError?.message?.includes('Failed to fetch') ||
            fetchError?.message?.includes('ERR_CONNECTION_REFUSED') ||
            fetchError?.cause?.code === 'ECONNREFUSED') {
          console.error('[ApiClient] Connection refused');
          throw new ApiError(
            'Connection refused: Unable to connect to the server. Please ensure the backend is running.',
            503,
            'CONNECTION_REFUSED'
          );
        }

        // Re-throw all other errors
        throw fetchError;
      }
    } catch (error: any) {
      console.error('[ApiClient] Error in get():', error);
      // Re-throw all errors to trigger loading states in components
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        ...this.defaultHeaders,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        ...this.defaultHeaders,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.defaultHeaders,
    });

    return this.handleResponse<T>(response);
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
