"use client";

import { useState } from "react";
import { TransactionsAPI, AccountsAPI, FutureAPI, NotificationsAPI, BankStatementsAPI } from "@/utils/api";
import {
  TransactionCreate,
  AccountCreate,
  FuturePredictionCreate,
  BankStatementUploadResponse,
  ReconciliationResponse,
} from "@/types/models";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { AccountForm } from "@/components/forms/AccountForm";
import { FutureForm } from "@/components/forms/FutureForm";

type ActionType = "transaction" | "account" | "future" | null;

export default function ControllerPage() {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBankActions, setShowBankActions] = useState(false);
  const [uploadStats, setUploadStats] = useState<BankStatementUploadResponse | null>(null);
  const [reconcileStats, setReconcileStats] = useState<ReconciliationResponse | null>(null);

  const handleSubmit = async (data: TransactionCreate | AccountCreate | FuturePredictionCreate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      switch (selectedAction) {
        case "transaction":
          await TransactionsAPI.create(data as TransactionCreate);
          setSuccess("Transaction created successfully");
          break;
        case "account":
          await AccountsAPI.create(data as AccountCreate);
          setSuccess("Account created successfully");
          break;
        case "future":
          await FutureAPI.create(data as FuturePredictionCreate);
          setSuccess("Future prediction created successfully");
          break;
      }
      setSelectedAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await NotificationsAPI.sendPaymentNotifications();
      setSuccess(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setUploadStats(null);

      console.log("Uploading file:", file.name);
      const response = await BankStatementsAPI.uploadICICI(file);
      console.log("Upload response:", response);
      
      setUploadStats(response);
      setSuccess("Bank statement uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload bank statement");
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleReconcile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setReconcileStats(null);

      const response = await BankStatementsAPI.reconcileICICI();
      setReconcileStats(response);
      setSuccess("Reconciliation completed successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reconcile transactions");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (selectedAction) {
      case "transaction":
        return <TransactionForm loading={loading} onSubmit={handleSubmit} />;
      case "account":
        return <AccountForm loading={loading} onSubmit={handleSubmit} />;
      case "future":
        return <FutureForm loading={loading} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  const renderStats = () => {
    if (uploadStats) {
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Upload Statistics:</h3>
          <p>Total Transactions: {uploadStats.total_transactions}</p>
          <p>New Transactions: {uploadStats.new_transactions}</p>
          <p>Duplicate Transactions: {uploadStats.duplicate_transactions}</p>
        </div>
      );
    }

    if (reconcileStats) {
      return (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">Reconciliation Statistics:</h3>
          <p>Total Transactions: {reconcileStats.total_transactions}</p>
          <p>Reconciled: {reconcileStats.reconciled_transactions}</p>
          <p>Unreconciled: {reconcileStats.unreconciled_transactions}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Controller</h1>
        {!selectedAction && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAction("transaction")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Add Transaction
            </button>
            <button
              onClick={() => setSelectedAction("account")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Add Account
            </button>
            <button
              onClick={() => setSelectedAction("future")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Add Future Entry
            </button>
            <button
              onClick={handleSendNotifications}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Payment Notifications"}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBankActions(!showBankActions)}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
              >
                Bank Actions
              </button>
              {showBankActions && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      Upload Bank Statement
                      <input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    <div className="px-4 py-2 text-sm text-gray-700">
                      Reconcile:
                      <div className="ml-2 space-y-1">
                        <button
                          onClick={handleReconcile}
                          disabled={loading}
                          className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          ICICI Bank
                        </button>
                        <button
                          className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          SBI (Coming Soon)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {renderStats()}

      {selectedAction && (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedAction === "transaction"
                ? "Add Transaction"
                : selectedAction === "account"
                ? "Add Account"
                : "Add Future Entry"}
            </h2>
            <button
              onClick={() => setSelectedAction(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {renderForm()}
        </div>
      )}
    </div>
  );
}
