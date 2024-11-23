import { useState } from "react";
import {
  PaymentMode,
  Department,
  Category,
  TransactionCreate,
  TransactionFormData,
} from "@/types/models";

interface TransactionFormProps {
  loading: boolean;
  onSubmit: (data: TransactionCreate) => Promise<void>;
}

export const TransactionForm = ({ loading, onSubmit }: TransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    ZohoMatch: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.Date &&
      formData.Description &&
      formData.Amount &&
      formData.PaymentMode &&
      formData.AccID &&
      formData.Department &&
      formData.Category
    ) {
      onSubmit(formData as TransactionCreate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          required
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Amount: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, PaymentMode: e.target.value as PaymentMode })}
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
          onChange={(e) => setFormData({ ...formData, AccID: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFormData({ ...formData, Department: e.target.value as Department })}
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
          onChange={(e) => setFormData({ ...formData, Category: e.target.value as Category })}
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
          onChange={(e) => setFormData({ ...formData, Comments: e.target.value })}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={formData.ZohoMatch}
          onChange={(e) => setFormData({ ...formData, ZohoMatch: e.target.checked })}
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
