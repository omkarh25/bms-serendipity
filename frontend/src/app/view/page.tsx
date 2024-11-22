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
      const [transactionsRes, accountsRes, futureRes] = await Promise.all([
        TransactionsAPI.getAll(),
        AccountsAPI.getAll(),
        FutureAPI.getAll(),
      ]);

      console.log('Accounts data:', accountsRes.data); // Debug log
      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
      setFuturePredictions(futureRes.data);
    } catch (err) {
      console.error('Error fetching data:', err); // Debug log
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      console.log('Account:', account); // Debug log
      return total + (account.Balance || 0);
    }, 0);
  };

  const calculateMonthlyExpenses = () => {
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
      .reduce((total, t) => total + Math.abs(t.Amount), 0);
  };

  const calculateUpcomingPayments = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return futurePredictions
      .filter((f) => !f.Paid && new Date(f.Date) <= nextMonth)
      .reduce((total, f) => total + Math.abs(f.Amount), 0);
  };

  const renderCAView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
            <p className="text-2xl font-bold text-green-600">₹{calculateTotalBalance().toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₹{calculateMonthlyExpenses().toFixed(2)}</p>
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
            <p className="text-2xl font-bold text-red-600">₹{calculateMonthlyExpenses().toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Payments</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{calculateUpcomingPayments().toFixed(2)}</p>
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
              if (transaction.Amount < 0) {
                acc[transaction.Department] = (acc[transaction.Department] || 0) + Math.abs(transaction.Amount);
              }
              return acc;
            }, {} as Record<string, number>)
          ).map(([department, amount]) => (
            <div key={department} className="flex justify-between items-center">
              <span className="text-gray-600">{department}</span>
              <span className="text-gray-900 font-medium">₹{amount.toFixed(2)}</span>
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
            <p className="text-2xl font-bold text-green-600">₹{calculateTotalBalance().toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₹{calculateMonthlyExpenses().toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Payments</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{calculateUpcomingPayments().toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Department Summary</h2>
          <div className="space-y-4">
            {Object.entries(
              transactions.reduce((acc, transaction) => {
                acc[transaction.Department] = (acc[transaction.Department] || 0) + transaction.Amount;
                return acc;
              }, {} as Record<string, number>)
            ).map(([department, balance]) => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-gray-600">{department}</span>
                <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{balance.toFixed(2)}
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
                acc[account.Type] = (acc[account.Type] || 0) + account.Balance;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, balance]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600">{type}</span>
                <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{balance.toFixed(2)}
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
