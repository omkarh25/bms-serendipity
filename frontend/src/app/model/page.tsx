"use client";

import { useEffect, useState } from "react";
import { ModelTable } from "@/components/tables/ModelTable";
import { useModelData, TableType } from "@/hooks/useModelData";
import { accountColumns, futureColumns, transactionColumns } from "@/utils/columnDefinitions";
import { Account, FuturePrediction, Transaction } from "@/types/models";

/**
 * ModelPage Component
 * Displays financial data in a tabular format with sorting, filtering, and pagination capabilities
 */
export default function ModelPage() {
  const [selectedTable, setSelectedTable] = useState<TableType>("transactions");
  const { data, loading, error, fetchData } = useModelData();

  useEffect(() => {
    fetchData(selectedTable);
  }, [selectedTable, fetchData]);

  /**
   * Renders the appropriate table based on the selected table type
   */
  const renderTable = () => {
    switch (selectedTable) {
      case "transactions":
        return (
          <ModelTable<Transaction>
            data={data as Transaction[]}
            columns={transactionColumns}
          />
        );
      case "accounts":
        return (
          <ModelTable<Account>
            data={data as Account[]}
            columns={accountColumns}
          />
        );
      case "future":
        return (
          <ModelTable<FuturePrediction>
            data={data as FuturePrediction[]}
            columns={futureColumns}
          />
        );
      default:
        return null;
    }
  };

  /**
   * Handles table type change
   */
  const handleTableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as TableType;
    console.log(`Changing table type from ${selectedTable} to ${newType}`);
    setSelectedTable(newType);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Model View</h1>
        <div className="relative">
          <label htmlFor="table-select" className="sr-only">
            Select table type
          </label>
          <select
            id="table-select"
            value={selectedTable}
            onChange={handleTableChange}
            className="block w-48 rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            aria-label="Select table type"
          >
            <option value="transactions">Transactions</option>
            <option value="accounts">Accounts</option>
            <option value="future">Future Predictions</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg 
              className="h-4 w-4 fill-current" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            role="status"
            aria-label="Loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        renderTable()
      )}
    </div>
  );
}
