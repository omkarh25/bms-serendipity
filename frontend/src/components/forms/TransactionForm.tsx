"use client";

import { useForm } from "@tanstack/react-form";
import { TransactionCreate, PaymentMode, Department, Category } from "@/types/models";

interface TransactionFormProps {
  loading: boolean;
  onSubmit: (data: TransactionCreate) => void;
}

export function TransactionForm({ loading, onSubmit }: TransactionFormProps) {
  const form = useForm<TransactionCreate>({
    defaultValues: {
      Date: new Date().toISOString().split('T')[0],
      Description: '',
      Amount: 0,
      PaymentMode: PaymentMode.Cash,
      AccID: '',
      Department: Department.Serendipity,
      Comments: '',
      Category: Category.Income,
      ZohoMatch: false
    },
    onSubmit: async (values) => {
      onSubmit(values);
    }
  });

  const getTypedFieldValue = <K extends keyof TransactionCreate>(
    field: K
  ): TransactionCreate[K] => {
    return form.getFieldValue(field) as TransactionCreate[K];
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={getTypedFieldValue('Date')}
          onChange={(e) => form.setFieldValue('Date', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={getTypedFieldValue('Description')}
          onChange={(e) => form.setFieldValue('Description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={getTypedFieldValue('Amount')}
          onChange={(e) => form.setFieldValue('Amount', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Mode <span className="text-red-500">*</span>
        </label>
        <select
          value={getTypedFieldValue('PaymentMode')}
          onChange={(e) => form.setFieldValue('PaymentMode', e.target.value as PaymentMode)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          {Object.values(PaymentMode).map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={getTypedFieldValue('AccID')}
          onChange={(e) => form.setFieldValue('AccID', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          value={getTypedFieldValue('Department')}
          onChange={(e) => form.setFieldValue('Department', e.target.value as Department)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          {Object.values(Department).map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={getTypedFieldValue('Category')}
          onChange={(e) => form.setFieldValue('Category', e.target.value as Category)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <input
          type="text"
          value={getTypedFieldValue('Comments') || ''}
          onChange={(e) => form.setFieldValue('Comments', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={getTypedFieldValue('ZohoMatch')}
          onChange={(e) => form.setFieldValue('ZohoMatch', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Zoho Match
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || form.state.isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
