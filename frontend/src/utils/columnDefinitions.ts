import { ColumnDef } from "@tanstack/react-table";
import { Account, FuturePrediction, Transaction } from "../types/models";

/**
 * Formats a number as Indian currency with 2 decimal places
 * @param value - The number to format
 * @returns Formatted string with ₹ symbol and 2 decimal places
 */
const formatCurrency = (value: unknown): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `₹${value.toFixed(2)}`;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `₹${num.toFixed(2)}`;
    }
  }
  return '-';
};

/**
 * Formats a date string to localized date string
 * @param value - The date string to format
 * @returns Formatted date string
 */
const formatDate = (value: unknown): string => {
  if (typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }
  return '-';
};

/**
 * Column definitions for the transactions table
 */
export const transactionColumns: ColumnDef<Transaction>[] = [
  { 
    accessorKey: "TrNo", 
    header: "SL No",
    sortingFn: "alphanumeric"
  },
  { 
    accessorKey: "Date", 
    header: "Date",
    cell: (info) => formatDate(info.getValue()),
  },
  { 
    accessorKey: "Description", 
    header: "Description"
  },
  { 
    accessorKey: "Amount", 
    header: "Amount",
    cell: (info) => formatCurrency(info.getValue()),
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

/**
 * Column definitions for the accounts table
 */
export const accountColumns: ColumnDef<Account>[] = [
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
    cell: (info) => formatCurrency(info.getValue()),
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
    cell: (info) => formatDate(info.getValue()),
  },
  { 
    accessorKey: "Bank", 
    header: "Bank"
  },
];

/**
 * Column definitions for the future predictions table
 */
export const futureColumns: ColumnDef<FuturePrediction>[] = [
  { 
    accessorKey: "TrNo", 
    header: "TR No",
    sortingFn: "alphanumeric"
  },
  { 
    accessorKey: "Date", 
    header: "Date",
    cell: (info) => formatDate(info.getValue()),
  },
  { 
    accessorKey: "Description", 
    header: "Description"
  },
  { 
    accessorKey: "Amount", 
    header: "Amount",
    cell: (info) => formatCurrency(info.getValue()),
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
