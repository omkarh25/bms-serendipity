"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { TransactionsAPI, AccountsAPI, FutureAPI } from "@/utils/api";
import { Transaction, Account, FuturePrediction } from "@/types/models";

type TableType = "transactions" | "accounts" | "future_predictions";

type TableDataType<T extends TableType> = 
  T extends "transactions" ? Transaction :
  T extends "accounts" ? Account :
  T extends "future_predictions" ? FuturePrediction :
  never;

interface ColumnMeta {
  type?: string;
  showStats?: boolean;
}

/**
 * ModelPage Component
 * Displays data in a tabular format with Excel-like features including:
 * - Column visibility toggle
 * - Advanced sorting and filtering
 * - Statistics for numeric fields
 * - Enhanced styling and spacing
 */
export default function ModelPage() {
  const [selectedTable, setSelectedTable] = useState<TableType>("transactions");
  const [data, setData] = useState<TableDataType<typeof selectedTable>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const transactionColumns: ColumnDef<Transaction>[] = [
    {
      header: "Transaction No",
      accessorKey: "TrNo",
    },
    {
      header: "Date",
      accessorKey: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      header: "Description",
      accessorKey: "Description",
    },
    {
      header: "Amount",
      accessorKey: "Amount",
      cell: ({ getValue }) => `₹${getValue() as number}`,
      sortingFn: (rowA, rowB, columnId): number => {
        const a = rowA.getValue(columnId) as number;
        const b = rowB.getValue(columnId) as number;
        return a < b ? -1 : a > b ? 1 : 0;
      },
      meta: {
        type: "number",
        showStats: true,
      } as ColumnMeta,
    },
    {
      header: "Payment Mode",
      accessorKey: "PaymentMode",
    },
    {
      header: "Account ID",
      accessorKey: "AccID",
    },
    {
      header: "Department",
      accessorKey: "Department",
    },
    {
      header: "Category",
      accessorKey: "Category",
    },
    {
      header: "Comments",
      accessorKey: "Comments",
    },
    {
      header: "Zoho Match",
      accessorKey: "ZohoMatch",
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {getValue() ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const accountColumns: ColumnDef<Account>[] = [
    {
      header: "SL No",
      accessorKey: "SLNo",
    },
    {
      header: "Account Name",
      accessorKey: "AccountName",
    },
    {
      header: "Type",
      accessorKey: "Type",
    },
    {
      header: "Account ID",
      accessorKey: "AccID",
    },
    {
      header: "Balance",
      accessorKey: "Balance",
      cell: ({ getValue }) => `₹${getValue() as number}`,
      sortingFn: (rowA, rowB, columnId): number => {
        const a = rowA.getValue(columnId) as number;
        const b = rowB.getValue(columnId) as number;
        return a < b ? -1 : a > b ? 1 : 0;
      },
      meta: {
        type: "number",
        showStats: true,
      } as ColumnMeta,
    },
    {
      header: "Interest Rate",
      accessorKey: "IntRate",
      cell: ({ getValue }) => `${getValue()}%`,
    },
    {
      header: "Next Due Date",
      accessorKey: "NextDueDate",
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : '',
    },
    {
      header: "Bank",
      accessorKey: "Bank",
    },
    {
      header: "Tenure",
      accessorKey: "Tenure",
    },
    {
      header: "EMI Amount",
      accessorKey: "EMIAmt",
      cell: ({ getValue }) => getValue() ? `₹${getValue() as number}` : '',
      meta: {
        type: "number",
        showStats: true,
      } as ColumnMeta,
    },
    {
      header: "Comments",
      accessorKey: "Comments",
    },
  ];

  const futurePredictionColumns: ColumnDef<FuturePrediction>[] = [
    {
      header: "Transaction No",
      accessorKey: "TrNo",
    },
    {
      header: "Date",
      accessorKey: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      header: "Description",
      accessorKey: "Description",
    },
    {
      header: "Amount",
      accessorKey: "Amount",
      cell: ({ getValue }) => `₹${getValue() as number}`,
      sortingFn: (rowA, rowB, columnId): number => {
        const a = rowA.getValue(columnId) as number;
        const b = rowB.getValue(columnId) as number;
        return a < b ? -1 : a > b ? 1 : 0;
      },
      meta: {
        type: "number",
        showStats: true,
      } as ColumnMeta,
    },
    {
      header: "Payment Mode",
      accessorKey: "PaymentMode",
    },
    {
      header: "Account ID",
      accessorKey: "AccID",
    },
    {
      header: "Department",
      accessorKey: "Department",
    },
    {
      header: "Category",
      accessorKey: "Category",
    },
    {
      header: "Comments",
      accessorKey: "Comments",
    },
    {
      header: "Paid",
      accessorKey: "Paid",
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {getValue() ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const columns = {
    transactions: transactionColumns,
    accounts: accountColumns,
    future_predictions: futurePredictionColumns,
  };

  const table = useReactTable({
    data,
    // @ts-expect-error - Dynamic column type based on selected table
    columns: columns[selectedTable],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
  });

  // Calculate statistics for numeric columns
  const getColumnStats = (columnId: string) => {
    const values = table.getFilteredRowModel().rows.map(row => {
      const value = row.getValue(columnId);
      return typeof value === 'number' ? value : null;
    }).filter((value): value is number => value !== null);

    if (values.length === 0) return null;

    const sum = values.reduce((acc, val) => acc + val, 0);
    const count = values.length;
    const avg = sum / count;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { sum, count, avg, max, min };
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      switch (selectedTable) {
        case "transactions":
          result = await TransactionsAPI.getAll();
          break;
        case "accounts":
          result = await AccountsAPI.getAll();
          break;
        case "future_predictions":
          result = await FutureAPI.getAll();
          break;
      }
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Dashboard</h1>
        <p className="text-gray-600 mt-2">View and manage data in tabular format</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value as TableType)}
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="transactions">Transactions</option>
            <option value="accounts">Accounts</option>
            <option value="future_predictions">Future Predictions</option>
          </select>

          <div className="relative">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search in all columns..."
              className="rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 w-64"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                const menu = document.getElementById('column-visibility-menu');
                menu?.classList.toggle('hidden');
              }}
            >
              Show/Hide Columns
            </button>
            <div
              id="column-visibility-menu"
              className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div className="py-1">
                {table.getAllLeafColumns().map(column => (
                  <label
                    key={column.id}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="mr-2"
                    />
                    {column.id}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? ''}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`
                      ${hoveredRow === row.id ? 'bg-blue-50' : ''}
                      ${row.index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
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
          </div>

          {/* Statistics Section */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {table.getAllLeafColumns().map(column => {
                const meta = column.columnDef.meta as ColumnMeta | undefined;
                const stats = getColumnStats(column.id);
                if (!stats || !meta?.showStats) return null;

                return (
                  <div key={column.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{column.id}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Sum:</span>
                        <span className="ml-2 font-medium">₹{stats.sum.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Count:</span>
                        <span className="ml-2 font-medium">{stats.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Average:</span>
                        <span className="ml-2 font-medium">₹{stats.avg.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Range:</span>
                        <span className="ml-2 font-medium">₹{stats.min.toFixed(2)} - ₹{stats.max.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 hover:bg-gray-200"
              >
                {"<<"}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 hover:bg-gray-200"
              >
                {"<"}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 hover:bg-gray-200"
              >
                {">"}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 hover:bg-gray-200"
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
                className="rounded border-gray-300 text-sm"
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
