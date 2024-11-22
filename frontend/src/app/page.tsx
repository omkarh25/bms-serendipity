export default function Home() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Business Management System
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome to BMS - A comprehensive system for managing business operations at Serendipity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Model</h2>
          <p className="text-gray-600 mb-4">
            View and manage data in tabular format with filtering and sorting capabilities.
          </p>
          <a
            href="/model"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Access Model
          </a>
        </div>

        {/* View Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">View</h2>
          <p className="text-gray-600 mb-4">
            Process and visualize data based on different roles (CA, Budget Analyst, Owner).
          </p>
          <a
            href="/view"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Access View
          </a>
        </div>

        {/* Controller Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Controller</h2>
          <p className="text-gray-600 mb-4">
            Execute operations like adding transactions, accounts, and managing future entries.
          </p>
          <a
            href="/controller"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Access Controller
          </a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Total Accounts</p>
            <p className="text-2xl font-bold text-blue-600">Loading...</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Recent Transactions</p>
            <p className="text-2xl font-bold text-blue-600">Loading...</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Pending Future Entries</p>
            <p className="text-2xl font-bold text-blue-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
