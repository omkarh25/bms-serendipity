import { useCallback, useState } from "react";
import { AccountsAPI, FutureAPI, TransactionsAPI } from "../utils/api";
import { Account, FuturePrediction, Transaction } from "../types/models";

export type TableType = "transactions" | "accounts" | "future";
type TableData = Transaction | Account | FuturePrediction;

/**
 * Custom hook for managing table data fetching and state
 * @returns Object containing data, loading state, error state, and fetch function
 */
export function useTableData() {
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

      switch (selectedTable) {
        case "transactions": {
          fetchedData = await TransactionsAPI.getAll();
          break;
        }
        case "accounts": {
          fetchedData = await AccountsAPI.getAll();
          break;
        }
        case "future": {
          fetchedData = await FutureAPI.getAll();
          break;
        }
        default:
          throw new Error(`Invalid table type: ${selectedTable}`);
      }

      if (!fetchedData.length) {
        throw new Error(`No ${selectedTable} data available`);
      }

      setData(fetchedData);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${selectedTable} data:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
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
