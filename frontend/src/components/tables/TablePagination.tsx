import React from 'react';
import { Table } from '@tanstack/react-table';

interface TablePaginationProps<T> {
  table: Table<T>;
}

/**
 * TablePagination Component
 * Displays pagination controls and page size selector
 */
export function TablePagination<T>({ table }: TablePaginationProps<T>) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          aria-label="First page"
        >
          {"<<"}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          aria-label="Previous page"
        >
          {"<"}
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          aria-label="Next page"
        >
          {">"}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          aria-label="Last page"
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
          aria-label="Select page size"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
