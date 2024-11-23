import { useCallback, useState } from "react";
import { AccountsAPI, FutureAPI, TransactionsAPI } from "../utils/api";
import { Account, FuturePrediction, Transaction } from "../types/models";

export type TableType = "transactions" | "accounts" | "future";
type TableData = Transaction | Account | FuturePrediction;

/**
 * Custom hook for managing model data fetching and state
 * @returns Object containing data, loading state, error state, and fetch function
 */
export function useModelData() {
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches data based on selected table type
   * @param selectedTable - Type of table to fetch data for
   */
  const fetchData = useCallback(async (selectedTable: TableType) => {
    setLoading(true);
    setError(null);

    try {
      let fetchedData: TableData[] = [];

      // Log the API URL being called
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
      console.log(`Fetching from ${baseUrl}/${selectedTable}/`);

      switch (selectedTable) {
        case "transactions": {
          try {
            fetchedData = await TransactionsAPI.getAll();
          } catch (err) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : 'Failed to fetch transactions. The transactions service might be unavailable.';
            throw new Error(errorMessage);
          }
          break;
        }
        case "accounts": {
          try {
            fetchedData = await AccountsAPI.getAll();
          } catch (err) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : 'The accounts service is currently under maintenance. Please try again later.';
            throw new Error(errorMessage);
          }
          break;
        }
        case "future": {
          try {
            fetchedData = await FutureAPI.getAll();
          } catch (err) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : 'The future predictions service is temporarily unavailable. Please try again later.';
            throw new Error(errorMessage);
          }
          break;
        }
        default:
          throw new Error(`Invalid table type: ${selectedTable}`);
      }

      // Log the response for debugging
      console.log(`${selectedTable} API Response:`, fetchedData);

      if (!fetchedData || !Array.isArray(fetchedData)) {
        throw new Error(`Invalid response format from ${selectedTable} service`);
      }

      if (!fetchedData.length) {
        const message = `No ${selectedTable} data available`;
        console.warn(message);
        setError(message);
        setData([]);
      } else {
        console.log(`Successfully fetched ${fetchedData.length} ${selectedTable} records`);
        setData(fetchedData);
        setError(null);
      }
    } catch (err) {
      console.error(`Error fetching ${selectedTable} data:`, err);
      
      let errorMessage = `Failed to fetch ${selectedTable} data`;
      if (err instanceof Error) {
        // Include more error details for debugging
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        errorMessage = err.message;
      }

      // Set a user-friendly error message
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData
  };
}
