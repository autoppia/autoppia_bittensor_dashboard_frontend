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

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: errorData.code,
      } as ApiError;
    }

    const data = await response.json();
    
    // Check if the API response indicates failure
    if (data && typeof data === 'object' && data.success === false) {
      // Handle specific error cases
      if (data.code === 'AGENT_RUN_NOT_FOUND') {
        throw {
          message: data.error || `Agent run with ID '${this.extractRunIdFromUrl(response.url)}' not found`,
          status: 404,
          code: 'AGENT_RUN_NOT_FOUND',
        } as ApiError;
      }
      
      throw {
        message: data.error || data.message || 'API request failed',
        status: response.status,
        code: data.code || 'API_ERROR',
      } as ApiError;
    }
    
    return {
      data,
      success: true,
    };
  }

  private extractRunIdFromUrl(url: string): string {
    const match = url.match(/\/agent-runs\/([^\/\?]+)/);
    return match ? match[1] : 'unknown';
  }

  private async handleNetworkError<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Instead of using mock data, throw an error to trigger loading states
    console.warn(`Backend not available for ${endpoint}, will show loading state`);
    
    throw {
      message: `Backend service unavailable for ${endpoint}`,
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
    } as ApiError;
  }

  private async handleAgentRunNotFound<T>(endpoint: string, runId: string): Promise<ApiResponse<T>> {
    // Handle specific case where agent run is not found
    console.warn(`Agent run ${runId} not found for ${endpoint}`);
    
    throw {
      message: `Agent run '${runId}' not found. Please check the URL or try a different run ID.`,
      status: 404,
      code: 'AGENT_RUN_NOT_FOUND',
    } as ApiError;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      // Re-throw all errors to trigger loading states in components
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });

    return this.handleResponse<T>(response);
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
