import { useState } from "react";
import {
  PaymentMode,
  AccountType,
  AccountCreate,
  AccountFormData,
} from "@/types/models";

interface AccountFormProps {
  loading: boolean;
  onSubmit: (data: AccountCreate) => Promise<void>;
}

export const AccountForm = ({ loading, onSubmit }: AccountFormProps) => {
  const [formData, setFormData] = useState<AccountFormData>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.AccountName &&
      formData.Type &&
      formData.AccID &&
      formData.Balance &&
      formData.IntRate &&
      formData.NextDueDate &&
      formData.Bank
    ) {
      onSubmit(formData as AccountCreate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Account Name</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, AccountName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Type: e.target.value as AccountType })}
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
        <label className="block text-sm font-medium text-gray-700">Account ID</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, AccID: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Balance</label>
        <input
          type="number"
          required
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Balance: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
        <input
          type="number"
          required
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, IntRate: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
        <input
          type="date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, NextDueDate: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bank</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Bank: e.target.value as PaymentMode })}
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
          onChange={(e) => setFormData({ ...formData, Tenure: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">EMI Amount</label>
        <input
          type="number"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, EMIAmt: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Comments</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Comments: e.target.value })}
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
