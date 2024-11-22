/**
 * Generic DataTable component for displaying tabular data with sorting and filtering
 */

"use client";

import { useState, useMemo, useEffect } from "react";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T]) => React.ReactNode;
}

interface DataTableProps<T> {
  data?: T[];
  columns: Column<T>[];
  initialSortKey?: keyof T;
  initialSortDirection?: "asc" | "desc";
  onRowClick?: (item: T) => void;
  filterPlaceholder?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  initialSortKey,
  initialSortDirection = "asc",
  onRowClick,
  filterPlaceholder = "Filter...",
}: DataTableProps<T>) {
  console.log('DataTable received data:', data);
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection
  );
  const [filterText, setFilterText] = useState("");

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" 
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }

      // Default string comparison for other types
      const aString = String(aValue);
      const bString = String(bValue);
      return sortDirection === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [data, sortKey, sortDirection]);

  // Handle filtering
  const filteredData = useMemo(() => {
    if (!filterText) return sortedData;

    const searchText = filterText.toLowerCase();
    return sortedData.filter((item) =>
      columns.some((column) => {
        const value = item[column.key];
        if (value === null || value === undefined) return false;
        if (typeof value === "object") return false;
        return String(value).toLowerCase().includes(searchText);
      })
    );
  }, [sortedData, filterText, columns]);

  // Move the empty data check after filtering
  const showNoDataMessage = !filteredData || filteredData.length === 0;

  // Handle sort click
  const handleSortClick = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    console.log('Current state:', {
      data,
      sortedData,
      filteredData,
      filterText,
      sortKey,
      sortDirection
    });
  }, [data, sortedData, filteredData, filterText, sortKey, sortDirection]);

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="p-4 bg-white">
        <input
          type="text"
          placeholder={filterPlaceholder}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      {showNoDataMessage ? (
        <div className="p-8 text-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key.toString()}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortClick(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {sortKey === column.key && (
                          <span className="text-gray-500">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-gray-50" : undefined
                    }
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key.toString()}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {column.render
                          ? column.render(item[column.key])
                          : String(item[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {filteredData.length} of {data.length} items
            </p>
          </div>
        </>
      )}
    </div>
  );
}
