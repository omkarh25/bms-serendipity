import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import { TableType } from '../../hooks/useTableData';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  selectedTable: TableType;
  globalFilter: string;
  sorting: SortingState;
  onTableChange: (type: TableType) => void;
  onGlobalFilterChange: (value: string) => void;
  onSortingChange: OnChangeFn<SortingState>;
}

/**
 * DataTable Component
 * Displays data in a table format with sorting, filtering, and pagination
 */
export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  selectedTable,
  globalFilter,
  sorting,
  onTableChange,
  onGlobalFilterChange,
  onSortingChange,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <div className="space-y-4">
      <TableHeader
        selectedTable={selectedTable}
        globalFilter={globalFilter}
        onTableChange={onTableChange}
        onSearchChange={onGlobalFilterChange}
      />

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

        <TablePagination table={table} />
      </div>
    </div>
  );
}
