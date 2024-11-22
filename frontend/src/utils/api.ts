/**
 * API client utility for communicating with the backend
 */

import {
  Transaction,
  Account,
  FuturePrediction,
  TransactionCreate,
  TransactionUpdate,
  AccountCreate,
  AccountUpdate,
  FuturePredictionCreate,
  FuturePredictionUpdate,
} from '../types/models';

// Default to environment variable, fallback to localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Generic API error class
 */
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic API response type
 */
type APIResponse<T> = {
  data: T;
  error?: string;
};

/**
 * Empty request type for endpoints that don't require a body
 */
type EmptyRequest = Record<string, never>;

/**
 * Base API client class with common HTTP methods
 */
class APIClient {
  private static async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new APIError(response.status, error.message || 'An error occurred');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      // If the response is already in the correct format, return it
      if (jsonData.data !== undefined) {
        return jsonData as APIResponse<T>;
      }
      // Otherwise, wrap the data in our response format
      return { data: jsonData as T };
    }
    
    throw new APIError(response.status, 'Invalid response format');
  }

  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<APIResponse<T>> {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      console.log(`Fetching from: ${url.toString()}`);
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw new APIError(500, error instanceof Error ? error.message : 'Network request failed');
    }
  }

  static async post<T, D>(endpoint: string, data: D): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw new APIError(500, error instanceof Error ? error.message : 'Network request failed');
    }
  }

  static async put<T, D>(endpoint: string, data: D): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw new APIError(500, error instanceof Error ? error.message : 'Network request failed');
    }
  }

  static async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw new APIError(500, error instanceof Error ? error.message : 'Network request failed');
    }
  }
}

/**
 * Transaction API endpoints
 */
export const TransactionsAPI = {
  getAll: (params?: Record<string, string>) => 
    APIClient.get<Transaction[]>('/transactions/', params),
  
  getById: (id: number) => 
    APIClient.get<Transaction>(`/transactions/${id}/`),
  
  create: (data: TransactionCreate) => 
    APIClient.post<Transaction, TransactionCreate>('/transactions/', data),
  
  update: (id: number, data: TransactionUpdate) => 
    APIClient.put<Transaction, TransactionUpdate>(`/transactions/${id}/`, data),
  
  delete: (id: number) => 
    APIClient.delete<Transaction>(`/transactions/${id}/`),
  
  getByDateRange: (startDate: string, endDate: string) => 
    APIClient.get<Transaction[]>(`/transactions/date-range/?start_date=${startDate}&end_date=${endDate}`),
};

/**
 * Account API endpoints
 */
export const AccountsAPI = {
  getAll: (params?: Record<string, string>) => 
    APIClient.get<Account[]>('/accounts/', params),
  
  getById: (id: number) => 
    APIClient.get<Account>(`/accounts/${id}/`),
  
  getByCcId: (ccId: string) => 
    APIClient.get<Account>(`/accounts/by-ccid/${ccId}/`),
  
  create: (data: AccountCreate) => 
    APIClient.post<Account, AccountCreate>('/accounts/', data),
  
  update: (id: number, data: AccountUpdate) => 
    APIClient.put<Account, AccountUpdate>(`/accounts/${id}/`, data),
  
  delete: (id: number) => 
    APIClient.delete<Account>(`/accounts/${id}/`),
  
  adjustBalance: (ccId: string, amount: number) => 
    APIClient.post<Account, { amount: number }>(`/accounts/${ccId}/balance/`, { amount }),
};

/**
 * Future Predictions API endpoints
 */
export const FutureAPI = {
  getAll: (params?: Record<string, string>) => 
    APIClient.get<FuturePrediction[]>('/future/', params),
  
  getById: (id: number) => 
    APIClient.get<FuturePrediction>(`/future/${id}/`),
  
  create: (data: FuturePredictionCreate) => 
    APIClient.post<FuturePrediction, FuturePredictionCreate>('/future/', data),
  
  update: (id: number, data: FuturePredictionUpdate) => 
    APIClient.put<FuturePrediction, FuturePredictionUpdate>(`/future/${id}/`, data),
  
  delete: (id: number) => 
    APIClient.delete<FuturePrediction>(`/future/${id}/`),
  
  markAsPaid: (id: number) => 
    APIClient.post<FuturePrediction, EmptyRequest>(`/future/${id}/mark-paid/`, {}),
  
  getByDateRange: (startDate: string, endDate: string) => 
    APIClient.get<FuturePrediction[]>(`/future/date-range/?start_date=${startDate}&end_date=${endDate}`),
};
