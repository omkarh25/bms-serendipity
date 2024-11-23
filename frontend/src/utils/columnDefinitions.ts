import { ColumnDef } from "@tanstack/react-table";
import { Transaction, Account, FuturePrediction } from "../types/models";
import { formatAmount, formatDate, formatBoolean } from "./formatters";

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
    cell: (info) => formatDate(info.getValue() as string)
  },
  { 
    accessorKey: "Description", 
    header: "Description"
  },
  { 
    accessorKey: "Amount", 
    header: "Amount",
    cell: (info) => formatAmount(info.getValue() as number),
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
    cell: (info) => formatBoolean(info.getValue() as boolean)
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
    cell: (info) => formatAmount(info.getValue() as number),
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
    cell: (info) => formatDate(info.getValue() as string)
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
    cell: (info) => formatDate(info.getValue() as string)
  },
  { 
    accessorKey: "Description", 
    header: "Description"
  },
  { 
    accessorKey: "Amount", 
    header: "Amount",
    cell: (info) => formatAmount(info.getValue() as number),
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
    cell: (info) => formatBoolean(info.getValue() as boolean)
  },
];
