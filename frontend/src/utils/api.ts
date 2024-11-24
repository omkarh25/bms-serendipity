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
  ICICITransaction,
  BankStatementUploadResponse,
  ReconciliationResponse,
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
 * Empty request type for endpoints that don't require a body
 */
type EmptyRequest = Record<string, never>;

/**
 * Base API client class with common HTTP methods
 */
class APIClient {
  /**
   * Handles API response and extracts data
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    try {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new APIError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new APIError(response.status, 'Invalid content type: expected JSON');
      }

      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        error
      });
      throw error;
    }
  }

  /**
   * Performs GET request
   */
  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      console.log(`GET Request to: ${url.toString()}`);
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof APIError ? error : new APIError(500, 'Network request failed');
    }
  }

  /**
   * Performs POST request with optional FormData support
   */
  static async post<T, D>(endpoint: string, data: D, isFormData: boolean = false): Promise<T> {
    try {
      console.log(`POST Request to: ${API_BASE_URL}${endpoint}`);
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: isFormData ? data as unknown as FormData : JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof APIError ? error : new APIError(500, 'Network request failed');
    }
  }

  /**
   * Performs PUT request
   */
  static async put<T, D>(endpoint: string, data: D): Promise<T> {
    try {
      console.log(`PUT Request to: ${API_BASE_URL}${endpoint}`);
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
      throw error instanceof APIError ? error : new APIError(500, 'Network request failed');
    }
  }

  /**
   * Performs DELETE request
   */
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      console.log(`DELETE Request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof APIError ? error : new APIError(500, 'Network request failed');
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

/**
 * Notifications API endpoints
 */
export const NotificationsAPI = {
  sendPaymentNotifications: () => 
    APIClient.post<{ message: string }, EmptyRequest>('/notifications/send-payment-notifications/', {}),
};

/**
 * Bank Statement API endpoints
 */
export const BankStatementsAPI = {
  uploadICICI: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return APIClient.post<BankStatementUploadResponse, FormData>('/bank-statements/upload/icici', formData, true);
  },

  reconcileICICI: () => 
    APIClient.post<ReconciliationResponse, EmptyRequest>('/bank-statements/reconcile/icici', {}),

  getICICITransactions: (params?: { reconciled?: string }) => 
    APIClient.get<ICICITransaction[]>('/bank-statements/icici', params),
};
