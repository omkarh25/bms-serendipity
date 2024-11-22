# BMS Frontend

The frontend application for the Business Management System (BMS), built with Next.js and TypeScript.

## Features

- **Model View**: Display and manage data in tabular format with filtering and sorting capabilities
- **Role-based Views**: Specialized data visualization for different roles (CA, Budget Analyst, Owner)
- **Controller**: Execute operations like adding transactions, accounts, and future entries
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── model/             # Model view component
│   │   ├── view/              # Role-based view components
│   │   ├── controller/        # Controller components
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx          # Home page component
│   │   └── globals.css       # Global styles
│   ├── components/            # Reusable components
│   │   └── DataTable.tsx     # Generic table component
│   ├── types/                 # TypeScript type definitions
│   │   └── models.ts         # Data model types
│   └── utils/                 # Utility functions
│       └── api.ts            # API client
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Components

### DataTable

A reusable table component with the following features:
- Sorting by columns
- Text-based filtering
- Customizable column rendering
- Pagination
- Row click handlers

```typescript
import { DataTable } from '@/components/DataTable';

// Example usage
<DataTable
  data={transactions}
  columns={[
    { key: 'date', header: 'Date' },
    { key: 'amount', header: 'Amount', render: (value) => `₹${value}` },
  ]}
  filterPlaceholder="Search transactions..."
/>
```

### Model View

Displays data in tabular format with:
- Table selection dropdown
- Advanced filtering
- Sorting capabilities
- Data export options

### Role-based Views

Specialized dashboards for different roles:
- CA View: Financial overview and account categories
- Budget Analyst View: Budget analysis and department expenses
- Owner View: Business overview and department summary

### Controller

Form-based interface for:
- Adding new transactions
- Creating accounts
- Managing future entries
- Validation and error handling

## API Integration

The frontend communicates with the backend using a typed API client:

```typescript
import { TransactionsAPI } from '@/utils/api';

// Example API call
const transactions = await TransactionsAPI.getAll();
```

## Styling

The application uses:
- Tailwind CSS for utility-first styling
- Custom CSS components in `globals.css`
- Responsive design patterns
- Consistent color scheme and typography

## Type Safety

All data models and API responses are fully typed:

```typescript
import { Transaction, Account, FuturePrediction } from '@/types/models';

// Type-safe data handling
const handleTransaction = (transaction: Transaction) => {
  // TypeScript ensures type safety
};
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## License

This project is licensed under the MIT License.
