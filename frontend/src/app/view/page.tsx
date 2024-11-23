"use client";

import { useState, useEffect } from "react";
import { TransactionsAPI, AccountsAPI, FutureAPI } from "@/utils/api";
import { Transaction, Account, FuturePrediction } from "@/types/models";
import CalendarView from "@/components/CalendarView";

type Role = "CA" | "Budget Analyst" | "Owner" | "Calendar";

export default function ViewPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("Owner");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedRole]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Using Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([
        TransactionsAPI.getAll(),
        AccountsAPI.getAll(),
        FutureAPI.getAll(),
      ]);

      // Process results and handle any individual failures
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          switch(index) {
            case 0:
              setTransactions(result.value as Transaction[]);
              break;
            case 1:
              console.log('Accounts data:', result.value);
              setAccounts(result.value as Account[]);
              break;
            case 2:
              setFuturePredictions(result.value as FuturePrediction[]);
              break;
          }
        } else {
          console.error(`Error fetching data for index ${index}:`, result.reason);
          // Set error message for the failed request
          setError(result.reason?.message || "Failed to fetch some data");
        }
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const parseBalance = (balance: number | string): number => {
    if (typeof balance === 'number') return balance;
    // Remove commas and convert to float
    const cleanValue = balance.replace(/,/g, '');
    const parsedValue = parseFloat(cleanValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const calculateTotalBalance = (): number => {
    if (!accounts || accounts.length === 0) return 0;
    const total = accounts.reduce((total, account) => {
      const balance = parseBalance(account.Balance);
      console.log(`Account ${account.AccountName}: ${balance}`);
      return total + balance;
    }, 0);
    console.log('Total balance:', total);
    return total;
  };

  const calculateMonthlyExpenses = (): number => {
    if (!transactions || transactions.length === 0) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.Date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear &&
          t.Amount < 0
        );
      })
      .reduce((total, t) => total + Math.abs(parseBalance(t.Amount)), 0);
  };

  const calculateUpcomingPayments = (): number => {
    if (!futurePredictions || futurePredictions.length === 0) return 0;
    const today = new Date();
    // Filter only unpaid future payments from today onwards
    return futurePredictions
      .filter((f) => !f.Paid && new Date(f.Date) >= today)
      .reduce((total, f) => total + Math.abs(parseBalance(f.Amount)), 0);
  };

  const renderCAView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalBalance())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(calculateMonthlyExpenses())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Account Types</h3>
            <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Categories</h2>
        <div className="space-y-4">
          {Object.entries(
            accounts.reduce((acc, account) => {
              acc[account.Type] = (acc[account.Type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-gray-600">{type}</span>
              <span className="text-gray-900 font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBudgetAnalystView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Budget Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Current Month Expenses</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(calculateMonthlyExpenses())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Payments</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(calculateUpcomingPayments())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Active Accounts</h3>
            <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Department Expenses</h2>
        <div className="space-y-4">
          {Object.entries(
            transactions.reduce((acc, transaction) => {
              if (parseBalance(transaction.Amount) < 0) {
                acc[transaction.Department] = (acc[transaction.Department] || 0) + Math.abs(parseBalance(transaction.Amount));
              }
              return acc;
            }, {} as Record<string, number>)
          ).map(([department, amount]) => (
            <div key={department} className="flex justify-between items-center">
              <span className="text-gray-600">{department}</span>
              <span className="text-gray-900 font-medium">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOwnerView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalBalance())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(calculateMonthlyExpenses())}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Payments</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(calculateUpcomingPayments())}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Department Summary</h2>
          <div className="space-y-4">
            {Object.entries(
              transactions.reduce((acc, transaction) => {
                const amount = parseBalance(transaction.Amount);
                acc[transaction.Department] = (acc[transaction.Department] || 0) + amount;
                return acc;
              }, {} as Record<string, number>)
            ).map(([department, balance]) => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-gray-600">{department}</span>
                <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Types Overview</h2>
          <div className="space-y-4">
            {Object.entries(
              accounts.reduce((acc, account) => {
                const balance = parseBalance(account.Balance);
                acc[account.Type] = (acc[account.Type] || 0) + balance;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, balance]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600">{type}</span>
                <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <CalendarView transactions={transactions} futurePredictions={futurePredictions} />
  );

  const renderContent = () => {
    switch (selectedRole) {
      case "CA":
        return renderCAView();
      case "Budget Analyst":
        return renderBudgetAnalystView();
      case "Owner":
        return renderOwnerView();
      case "Calendar":
        return renderCalendarView();
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">View Dashboard</h1>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="Owner">Owner</option>
          <option value="CA">CA</option>
          <option value="Budget Analyst">Budget Analyst</option>
          <option value="Calendar">Calendar</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}
