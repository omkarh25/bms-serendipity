import { useState, useCallback, useEffect } from 'react';
import { SortingState } from '@tanstack/react-table';
import { TransactionsAPI, AccountsAPI, FutureAPI } from '../utils/api';
import { Transaction, Account, FuturePrediction } from '../types/models';
import { transactionColumns, accountColumns, futureColumns } from '../utils/columnDefinitions';

export type TableType = "transactions" | "accounts" | "future";

/**
 * Custom hook for managing table data and state
 * @returns Table data and state management functions
 */
export function useTableData() {
  const [selectedTable, setSelectedTable] = useState<TableType>("transactions");
  const [data, setData] = useState<(Transaction | Account | FuturePrediction)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Fetch data based on selected table type
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(`Fetching ${selectedTable} data...`);

    try {
      switch (selectedTable) {
        case "transactions": {
          const response = await TransactionsAPI.getAll();
          if (!response) {
            throw new Error("Invalid response format");
          }
          const transactions = Array.isArray(response) ? response : response.data;
          if (!transactions || !transactions.length) {
            throw new Error("No transactions found");
          }
          setData(transactions);
          break;
        }
        case "accounts": {
          const response = await AccountsAPI.getAll();
          if (!response) {
            throw new Error("Invalid response format");
          }
          const accounts = Array.isArray(response) ? response : response.data;
          if (!accounts) {
            throw new Error("No accounts found");
          }
          setData(accounts);
          break;
        }
        case "future": {
          const response = await FutureAPI.getAll();
          if (!response) {
            throw new Error("Invalid response format");
          }
          const predictions = Array.isArray(response) ? response : response.data;
          if (!predictions) {
            throw new Error("No future predictions found");
          }
          setData(predictions);
          break;
        }
      }
      console.log(`Successfully fetched ${selectedTable} data`);
    } catch (err) {
      console.error("API Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch data. Please check your network connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Get column definitions based on selected table type
   */
  const getColumns = useCallback(() => {
    switch (selectedTable) {
      case "transactions":
        return transactionColumns;
      case "accounts":
        return accountColumns;
      case "future":
        return futureColumns;
      default:
        return [];
    }
  }, [selectedTable]);

  /**
   * Handle table type change
   */
  const handleTableChange = useCallback((newType: TableType) => {
    console.log(`Changing table type from ${selectedTable} to ${newType}`);
    setSelectedTable(newType);
    setGlobalFilter("");
    setSorting([]);
  }, [selectedTable]);

  return {
    selectedTable,
    data,
    loading,
    error,
    globalFilter,
    sorting,
    columns: getColumns(),
    setGlobalFilter,
    setSorting,
    handleTableChange,
  };
}
