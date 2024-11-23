"use client";

import { DataTable } from "../../components/tables/DataTable";
import { useTableData } from "../../hooks/useTableData";
import { Transaction, Account, FuturePrediction } from "../../types/models";
import { ColumnDef } from "@tanstack/react-table";

type TableData = Transaction | Account | FuturePrediction;

/**
 * ModelPage Component
 * Main page component that displays financial data in a tabular format
 */
export default function ModelPage() {
  const {
    selectedTable,
    data,
    loading,
    error,
    globalFilter,
    sorting,
    columns,
    setGlobalFilter,
    setSorting,
    handleTableChange,
  } = useTableData();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DataTable<TableData>
        data={data}
        columns={columns as Array<ColumnDef<TableData, unknown>>}
        selectedTable={selectedTable}
        globalFilter={globalFilter}
        sorting={sorting}
        onTableChange={handleTableChange}
        onGlobalFilterChange={setGlobalFilter}
        onSortingChange={setSorting}
      />
    </div>
  );
}
