# Business Management System (BMS)

A comprehensive web application that assists in working with tabular data by providing MVC functionality. Currently implemented for the Serendipity book keeping section.

## Overview

BMS is a full-stack application that helps manage business operations through:
- Model: Data visualization in tabular format with filtering and sorting
- View: Role-based data representation (CA, Budget Analyst, Owner)
- Controller: Process execution for transactions, accounts, and future entries

## Tech Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- Type-safe API client
- Responsive design

### Backend
- FastAPI (Python)
- SQLite database
- SQLAlchemy ORM
- Pydantic for data validation

### Deployment
- Docker and Docker Compose
- Production-ready configuration

## Project Structure

```
bms-serendipity/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configurations
│   │   ├── crud/           # Database operations
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend Docker configuration
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js pages and components
│   │   ├── components/    # Reusable React components
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── package.json       # Node.js dependencies
├── docs/                  # Project documentation
└── docker-compose.yml     # Docker Compose configuration
```

## Features

### Model View
- Tabular data display with sorting and filtering
- Multiple table support (Transactions, Accounts, Future Predictions)
- Advanced search capabilities

### Role-based Views
- CA View: Financial overview and account categorization
- Budget Analyst View: Budget analysis and expense tracking
- Owner View: Comprehensive business overview

### Controller Functions
- Transaction management
- Account creation and updates
- Future entry predictions
- Automated calculations

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18.x or higher (for local development)
- Python 3.8 or higher (for local development)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bms-serendipity.git
cd bms-serendipity
```

2. Start the development environment:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The API documentation is available at `/docs` when running the backend server. It includes:
- Endpoint specifications
- Request/response schemas
- Authentication details
- Example requests

## Database Schema

### TransactionsPast
- Transaction records with categorization
- Payment tracking
- Department allocation

### AccountsPresent
- Account management
- Balance tracking
- Interest calculations

### FreedomFuture
- Future transaction predictions
- Payment scheduling
- Budget planning

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

### Backend
- Follow PEP 8 style guide
- Write comprehensive docstrings
- Include type hints
- Add unit tests for new features

### Frontend
- Use TypeScript for type safety
- Follow React best practices
- Maintain component reusability
- Write clean, documented code

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

### Using Docker Compose
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Manual Deployment
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Environment Variables

### Backend (.env)
```env
DEBUG=1
DATABASE_URL=sqlite:///./kaas.db
SECRET_KEY=your-secret-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI for the excellent Python web framework
- Next.js team for the React framework
- SQLAlchemy for the ORM
- All contributors and users of the system
