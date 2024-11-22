"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionsAPI, AccountsAPI, FutureAPI } from "@/utils/api";
import { 
  Transaction, 
  Account, 
  FuturePrediction
} from "@/types/models";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

type TableType = "transactions" | "accounts" | "future";

type APIResponseWrapper<T> = {
  data?: T[];
  error?: string;
} | T[];

type TableData = Transaction | Account | FuturePrediction;

/**
 * ModelPage Component
 * Displays financial data in a tabular format using TanStack Table
 * with sorting, filtering, and pagination capabilities
 */
export default function ModelPage() {
  const [selectedTable, setSelectedTable] = useState<TableType>("transactions");
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Column definitions for each table type
  const transactionColumns: ColumnDef<Transaction>[] = [
    { 
      accessorKey: "TrNo", 
      header: "SL No",
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: (info) => {
        const date = info.getValue() as string;
        return date ? new Date(date).toLocaleDateString() : '-';
      }
    },
    { 
      accessorKey: "Description", 
      header: "Description"
    },
    { 
      accessorKey: "Amount", 
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue() as number;
        return amount !== undefined ? `₹${amount.toFixed(2)}` : '-';
      },
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "PaymentMode", 
      header: "Payment Mode"
    },
    { 
      accessorKey: "AccID", 
      header: "Account ID"
    },
    { 
      accessorKey: "Department", 
      header: "Department"
    },
    { 
      accessorKey: "Category", 
      header: "Category"
    },
    { 
      accessorKey: "ZohoMatch", 
      header: "Zoho Match",
      cell: (info) => (info.getValue() as boolean) ? "Yes" : "No"
    },
  ];

  const accountColumns: ColumnDef<Account>[] = [
    { 
      accessorKey: "SLNo", 
      header: "SL No",
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "AccountName", 
      header: "Account Name"
    },
    { 
      accessorKey: "Type", 
      header: "Type"
    },
    { 
      accessorKey: "AccID", 
      header: "CC ID"
    },
    { 
      accessorKey: "Balance", 
      header: "Balance",
      cell: (info) => {
        const balance = info.getValue() as number;
        return balance !== undefined ? `₹${balance.toFixed(2)}` : '-';
      },
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "IntRate", 
      header: "Interest Rate",
      cell: (info) => {
        const rate = info.getValue() as number;
        return rate !== undefined ? `${rate}%` : '-';
      },
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "NextDueDate", 
      header: "Next Due Date",
      cell: (info) => {
        const date = info.getValue() as string;
        return date ? new Date(date).toLocaleDateString() : '-';
      }
    },
    { 
      accessorKey: "Bank", 
      header: "Bank"
    },
  ];

  const futureColumns: ColumnDef<FuturePrediction>[] = [
    { 
      accessorKey: "TrNo", 
      header: "TR No",
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: (info) => {
        const date = info.getValue() as string;
        return date ? new Date(date).toLocaleDateString() : '-';
      }
    },
    { 
      accessorKey: "Description", 
      header: "Description"
    },
    { 
      accessorKey: "Amount", 
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue() as number;
        return amount !== undefined ? `₹${amount.toFixed(2)}` : '-';
      },
      sortingFn: "alphanumeric"
    },
    { 
      accessorKey: "PaymentMode", 
      header: "Payment Mode"
    },
    { 
      accessorKey: "AccID", 
      header: "Account ID"
    },
    { 
      accessorKey: "Department", 
      header: "Department"
    },
    { 
      accessorKey: "Category", 
      header: "Category"
    },
    { 
      accessorKey: "Paid", 
      header: "Paid",
      cell: (info) => (info.getValue() as boolean) ? "Yes" : "No"
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(`Fetching ${selectedTable} data...`);

    try {
      let response: APIResponseWrapper<TableData>;
      switch (selectedTable) {
        case "transactions":
          response = await TransactionsAPI.getAll();
          if (!response) {
            throw new Error("Invalid response format");
          }
          const transactions = Array.isArray(response) ? response : response.data;
          if (!transactions || !transactions.length) {
            throw new Error("No transactions found");
          }
          setData(transactions);
          break;
        case "accounts":
          response = await AccountsAPI.getAll();
          if (!response) {
            throw new Error("Invalid response format");
          }
          const accounts = Array.isArray(response) ? response : response.data;
          if (!accounts) {
            throw new Error("No accounts found");
          }
          setData(accounts);
          break;
        case "future":
          response = await FutureAPI.getAll();
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

  const getColumns = () => {
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
  };

  const handleTableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as TableType;
    console.log(`Changing table type from ${selectedTable} to ${newType}`);
    setSelectedTable(newType);
    setGlobalFilter("");
    setSorting([]);
  };

  const table = useReactTable({
    data: data as TableData[],
    columns: getColumns() as ColumnDef<TableData>[],
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Model View</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="px-4 py-2 border rounded-md"
          />
          <div className="relative">
            <select
              value={selectedTable}
              onChange={handleTableChange}
              className="appearance-none block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="transactions">Transactions</option>
              <option value="accounts">Accounts</option>
              <option value="future">Future Predictions</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {
                          {
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null
                        }
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                {"<<"}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                {"<"}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                {">"}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                {">>"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="px-2 py-1 text-sm border rounded-md"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
