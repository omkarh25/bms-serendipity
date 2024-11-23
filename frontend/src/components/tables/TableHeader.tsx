import React from 'react';
import { TableType } from '../../hooks/useTableData';

interface TableHeaderProps {
  selectedTable: TableType;
  globalFilter: string;
  onTableChange: (type: TableType) => void;
  onSearchChange: (value: string) => void;
}

/**
 * TableHeader Component
 * Displays the table title, search input, and table type selector
 */
export function TableHeader({
  selectedTable,
  globalFilter,
  onTableChange,
  onSearchChange,
}: TableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Model View</h1>
      <div className="flex gap-4">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search all columns..."
          className="px-4 py-2 border rounded-md"
          aria-label="Search"
        />
        <select
          value={selectedTable}
          onChange={(e) => onTableChange(e.target.value as TableType)}
          className="px-4 py-2 border rounded-md text-gray-900 bg-white"
          aria-label="Select table type"
        >
          <option value="transactions">Transactions</option>
          <option value="accounts">Accounts</option>
          <option value="future">Future Predictions</option>
        </select>
      </div>
    </div>
  );
}
