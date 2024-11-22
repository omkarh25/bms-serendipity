"use client";

import { useState } from "react";
import { TransactionsAPI, AccountsAPI, FutureAPI } from "@/utils/api";
import {
  PaymentMode,
  Department,
  Category,
  AccountType,
  TransactionCreate,
  AccountCreate,
  FuturePredictionCreate,
  TransactionFormData,
  AccountFormData,
  FuturePredictionFormData,
} from "@/types/models";

type ActionType = "transaction" | "account" | "future" | null;

export default function ControllerPage() {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const TransactionForm = () => {
    const [formData, setFormData] = useState<TransactionFormData>({
      zoho_match: false,
    });

    const handleSubmitTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        formData.date &&
        formData.description &&
        formData.amount &&
        formData.payment_mode &&
        formData.acc_id &&
        formData.department &&
        formData.category
      ) {
        handleSubmit(formData as TransactionCreate);
      }
    };

    return (
      <form onSubmit={handleSubmitTransaction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as PaymentMode })}
          >
            <option value="">Select Payment Mode</option>
            {Object.values(PaymentMode).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account ID</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, acc_id: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
          >
            <option value="">Select Department</option>
            {Object.values(Department).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          >
            <option value="">Select Category</option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.zoho_match}
            onChange={(e) => setFormData({ ...formData, zoho_match: e.target.checked })}
          />
          <label className="ml-2 block text-sm text-gray-900">Zoho Match</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Transaction"}
        </button>
      </form>
    );
  };

  const AccountForm = () => {
    const [formData, setFormData] = useState<AccountFormData>({});

    const handleSubmitAccount = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        formData.account_name &&
        formData.type &&
        formData.cc_id &&
        formData.balance &&
        formData.int_rate &&
        formData.next_due_date &&
        formData.bank
      ) {
        handleSubmit(formData as AccountCreate);
      }
    };

    return (
      <form onSubmit={handleSubmitAccount} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
          >
            <option value="">Select Account Type</option>
            {Object.values(AccountType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CC ID</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, cc_id: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Balance</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, int_rate: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, bank: e.target.value as PaymentMode })}
          >
            <option value="">Select Bank</option>
            {Object.values(PaymentMode).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tenure (months)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, tenure: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">EMI Amount</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, emi_amt: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    );
  };

  const FutureForm = () => {
    const [formData, setFormData] = useState<FuturePredictionFormData>({
      paid: false,
    });

    const handleSubmitFuture = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        formData.date &&
        formData.description &&
        formData.amount &&
        formData.payment_mode &&
        formData.acc_id &&
        formData.department &&
        formData.category
      ) {
        handleSubmit(formData as FuturePredictionCreate);
      }
    };

    return (
      <form onSubmit={handleSubmitFuture} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as PaymentMode })}
          >
            <option value="">Select Payment Mode</option>
            {Object.values(PaymentMode).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account ID</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, acc_id: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
          >
            <option value="">Select Department</option>
            {Object.values(Department).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          >
            <option value="">Select Category</option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.paid}
            onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
          />
          <label className="ml-2 block text-sm text-gray-900">Paid</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Future Prediction"}
        </button>
      </form>
    );
  };

  const renderForm = () => {
    switch (selectedAction) {
      case "transaction":
        return <TransactionForm />;
      case "account":
        return <AccountForm />;
      case "future":
        return <FutureForm />;
      default:
        return null;
    }
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
