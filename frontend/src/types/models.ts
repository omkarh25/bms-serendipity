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

// Base interfaces
interface TransactionBase {
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

interface AccountBase {
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

interface FuturePredictionBase {
  Date: string;
  Description: string;
  Amount: number;
  PaymentMode: PaymentMode;
  AccID: string;
  Department: Department;
  Comments?: string;
  Category: Category;
  Paid: boolean;
}

// Create interfaces
export type TransactionCreate = TransactionBase;
export type AccountCreate = AccountBase;
export type FuturePredictionCreate = FuturePredictionBase;

// Update interfaces
export type TransactionUpdate = Partial<TransactionBase>;
export type AccountUpdate = Partial<AccountBase>;
export type FuturePredictionUpdate = Partial<FuturePredictionBase>;

// Full interfaces with IDs
export interface Transaction extends TransactionBase {
  TrNo: number;
}

export interface Account extends AccountBase {
  SLNo: number;
}

export interface FuturePrediction extends FuturePredictionBase {
  TrNo: number;
}

// Bank Statement interfaces
export interface ICICITransaction {
  id: number;
  transaction_date: string;
  value_date: string;
  description: string;
  ref_no: string;
  debit?: number;
  credit?: number;
  balance: number;
  reconciled: boolean;
  transaction_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BankStatementUploadResponse {
  total_transactions: number;
  new_transactions: number;
  duplicate_transactions: number;
  message: string;
}

export interface ReconciliationResponse {
  total_transactions: number;
  reconciled_transactions: number;
  unreconciled_transactions: number;
  message: string;
}
