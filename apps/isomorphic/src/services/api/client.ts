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
    return {
      data,
      success: true,
    };
  }

  private async handleNetworkError<T>(endpoint: string): Promise<ApiResponse<T>> {
    // If we can't reach the backend, we'll return mock data for development
    console.warn(`Backend not available for ${endpoint}, using mock data`);
    
    // Import mock data dynamically to avoid circular dependencies
    const { 
      mockOverviewMetrics,
      mockValidators,
      mockCurrentRound,
      mockLeaderboard,
      mockSubnetStatistics,
      mockNetworkStatus,
      mockRecentActivity,
      mockPerformanceTrends
    } = await import('./mock-data');

    // Map endpoints to mock data
    const mockDataMap: Record<string, any> = {
      '/api/v1/overview/metrics': { metrics: mockOverviewMetrics },
      '/api/v1/overview/validators': { validators: mockValidators, total: mockValidators.length, page: 1, limit: 10 },
      '/api/v1/overview/rounds/current': { round: mockCurrentRound },
      '/api/v1/overview/rounds': { rounds: [mockCurrentRound], currentRound: mockCurrentRound, total: 1 },
      '/api/v1/overview/leaderboard': { leaderboard: mockLeaderboard, total: mockLeaderboard.length, timeRange: { start: '', end: '' } },
      '/api/v1/overview/statistics': { statistics: mockSubnetStatistics },
      '/api/v1/overview/network-status': mockNetworkStatus,
      '/api/v1/overview/recent-activity': mockRecentActivity,
      '/api/v1/overview/performance-trends': mockPerformanceTrends,
    };

    const mockData = mockDataMap[endpoint];
    if (mockData) {
      return {
        data: mockData,
        success: true,
      };
    }

    // If no mock data available, throw error
    throw {
      message: `No mock data available for ${endpoint}`,
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
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
      // If it's a network error (backend not available), use mock data
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return this.handleNetworkError<T>(endpoint);
      }
      // Re-throw other errors
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
