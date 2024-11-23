"use client";

import { AccountCreate } from "@/types/models";
import { useState } from "react";

interface AccountFormProps {
  loading: boolean;
  onSubmit: (data: AccountCreate) => void;
}

type AccountType = 'EMI' | 'Chit' | 'HL' | 'CC' | 'CAS' | 'ACC' | 'CON';

export function AccountForm({ loading, onSubmit }: AccountFormProps) {
  const [formData, setFormData] = useState<AccountCreate>({
    AccountName: '',
    Type: '' as AccountType,
    Balance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      Type: e.target.value as AccountType
    }));
  };

  const accountTypes: AccountType[] = [
    'EMI',
    'Chit',
    'HL',
    'CC',
    'CAS',
    'ACC',
    'CON'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="AccountName" className="block text-sm font-medium text-gray-700">
          Account Name
        </label>
        <input
          type="text"
          id="AccountName"
          name="AccountName"
          value={formData.AccountName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="Type" className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <select
          id="Type"
          name="Type"
          value={formData.Type}
          onChange={handleSelectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select type</option>
          {accountTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="Balance" className="block text-sm font-medium text-gray-700">
          Initial Balance
        </label>
        <input
          type="number"
          id="Balance"
          name="Balance"
          value={formData.Balance}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          step="0.01"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Account'}
      </button>
    </form>
  );
}
