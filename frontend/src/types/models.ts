/**
 * Common types used across the application
 */

export enum PaymentMode {
  Cash = "Cash",
  Credit = "Credit",
  Dollars = "Dollars",
  ICICI_090 = "ICICI_090",
  ICICI_Current = "ICICI_Current",
  ICICI_CC_9003 = "ICICI_CC_9003",
  ICICI_CC_1009 = "ICICI_CC_1009",
  SBI = "SBI",
  SBI_3479 = "SBI_3479",
  DBS = "DBS",
  Debit = "Debit"
}

export enum Department {
  Serendipity = "Serendipity",
  Dhoom_Studios = "Dhoom Studios",
  Trademan = "Trademan"
}

export enum Category {
  Salaries = "Salaries",
  Hand_Loans = "Hand Loans",
  Maintenance = "Maintenance",
  Income = "Income",
  EMI = "EMI",
  Chits = "Chits"
}

export enum AccountType {
  HL = "HL",
  EMI = "EMI",
  HLG = "HLG",
  CC = "CC",
  CAS = "CAS",
  Chit = "Chit",
  CON = "CON",
  ACC = "ACC"
}

export interface Transaction extends Record<string, unknown> {
  TrNo: number;
  Date: string;
  Description: string;
  Amount: number;
  PaymentMode: PaymentMode;
  AccID: string;
  Department: Department;
  Comments?: string;
  Category: Category;
  ZohoMatch: boolean;
}

export interface Account extends Record<string, unknown> {
  SLNo: number;
  AccountName: string;
  Type: AccountType;
  AccID: string;
  Balance: number;
  IntRate: number;
  NextDueDate: string;
  Bank: PaymentMode;
  Tenure?: number;
  EMIAmt?: number;
  Comments?: string;
}

export interface FuturePrediction extends Record<string, unknown> {
  TrNo: number;
  Date: string;
  Description: string;
  Amount: number;
  PaymentMode: PaymentMode;
  AccID: string;
  Department: Department;
  Comments?: string;
  Category: Category;
  Paid: boolean;  // Updated to use boolean since API returns false/true
}

// Form interfaces for creating new records
export interface TransactionFormData {
  Date?: string;
  Description?: string;
  Amount?: number;
  PaymentMode?: PaymentMode;
  AccID?: string;
  Department?: Department;
  Comments?: string;
  Category?: Category;
  ZohoMatch?: boolean;
}

export interface AccountFormData {
  AccountName?: string;
  Type?: AccountType;
  AccID?: string;
  Balance?: number;
  IntRate?: number;
  NextDueDate?: string;
  Bank?: PaymentMode;
  Tenure?: number;
  EMIAmt?: number;
  Comments?: string;
}

export interface FuturePredictionFormData {
  Date?: string;
  Description?: string;
  Amount?: number;
  PaymentMode?: PaymentMode;
  AccID?: string;
  Department?: Department;
  Comments?: string;
  Category?: Category;
  Paid?: boolean;  // Updated to use boolean
}

// Type for creating a new transaction
export type TransactionCreate = Omit<Transaction, 'TrNo'>;

// Type for updating an existing transaction
export type TransactionUpdate = Partial<TransactionCreate>;

// Type for creating a new account
export type AccountCreate = Omit<Account, 'SLNo'>;

// Type for updating an existing account
export type AccountUpdate = Partial<AccountCreate>;

// Type for creating a new future prediction
export type FuturePredictionCreate = Omit<FuturePrediction, 'TrNo'>;

// Type for updating an existing future prediction
export type FuturePredictionUpdate = Partial<FuturePredictionCreate>;
