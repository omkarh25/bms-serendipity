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

type TableType = "transactions" | "accounts" | "future_predictions";

interface TransactionData {
  Date: string;
  Amount: number;
  Department: string;
}

interface AccountData {
  AccountName: string;
  Type: string;
  Balance: number;
}

interface FuturePredictionData {
  Date: string;
  Amount: number;
  Description: string;
  Paid: boolean;
}

type TableDataType<T extends TableType> = 
  T extends "transactions" ? TransactionData :
  T extends "accounts" ? AccountData :
  T extends "future_predictions" ? FuturePredictionData :
  never;

export default function ModelPage() {
  const [selectedTable, setSelectedTable] = useState<TableType>("transactions");
  const [data, setData] = useState<TableDataType<typeof selectedTable>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const transactionColumns: ColumnDef<TransactionData>[] = [
    {
      header: "Date",
      accessorKey: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      header: "Amount",
      accessorKey: "Amount",
      cell: ({ getValue }) => `₹${getValue() as number}`,
    },
    {
      header: "Department",
      accessorKey: "Department",
    },
  ];

  const accountColumns: ColumnDef<AccountData>[] = [
    {
      header: "Account Name",
      accessorKey: "AccountName",
    },
    {
      header: "Type",
      accessorKey: "Type",
    },
    {
      header: "Balance",
      accessorKey: "Balance",
      cell: ({ getValue }) => `₹${getValue() as number}`,
    },
  ];

  const futurePredictionColumns: ColumnDef<FuturePredictionData>[] = [
    {
      header: "Date",
      accessorKey: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      header: "Amount",
      accessorKey: "Amount",
      cell: ({ getValue }) => `₹${getValue() as number}`,
    },
    {
      header: "Description",
      accessorKey: "Description",
    },
    {
      header: "Paid",
      accessorKey: "Paid",
      cell: ({ getValue }) => (getValue() as boolean) ? "Yes" : "No",
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
    },
    onGlobalFilterChange: setGlobalFilter,
  });

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Model Dashboard</h1>
        <p className="text-gray-600 mt-2">View and manage data in tabular format</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value as TableType)}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="transactions">Transactions</option>
          <option value="accounts">Accounts</option>
          <option value="future_predictions">Future Predictions</option>
        </select>

        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        />
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
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

          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50"
              >
                {"<<"}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50"
              >
                {"<"}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50"
              >
                {">"}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
