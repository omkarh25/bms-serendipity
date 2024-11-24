# Backend Service

This is the backend service for the BMS Serendipity application. It provides APIs for managing future payments and notifications.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```env
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE_NUMBER=your_phone_number
TELEGRAM_CHAT_ID=your_chat_id
```

## API Endpoints

### Future Payments

1. Get all future predictions:
```
GET /api/v1/future/predictions
```
- Optional query parameters:
  - `paid_status`: Filter by paid status (true/false)
  - `start_date`: Filter by start date (YYYY-MM-DD)
  - `end_date`: Filter by end date (YYYY-MM-DD)

2. Get upcoming predictions:
```
GET /api/v1/future/predictions/upcoming
```
- Query parameters:
  - `days_ahead`: Number of days to look ahead (default: 7)

3. Mark prediction as paid:
```
POST /api/v1/future/predictions/{tr_no}/mark-paid
```

### Notifications

1. Send payment notifications:
```
POST /api/v1/notifications/send-payment-notifications
```
- Query parameters:
  - `days_ahead`: Number of days to look ahead for payments (default: 7)

## Running Tests

The test suite uses the actual `kaas.db` database to ensure tests are run against real data.

1. Run all tests:
```bash
pytest backend/tests/
```

2. Run tests with output:
```bash
pytest -v backend/tests/
```

3. Run specific test file:
```bash
pytest backend/tests/test_endpoints.py
```

4. Run specific test:
```bash
pytest backend/tests/test_endpoints.py -k "test_get_future_predictions"
```

5. Run tests with print output:
```bash
pytest -v backend/tests/ -s
```

### Test Cases

The test suite includes the following test cases:

1. Future Predictions:
   - Get all predictions
   - Get unpaid predictions
   - Get predictions by date range
   - Get upcoming predictions

2. Notifications:
   - Send payment notifications
   - Handle notification service unavailability

3. Payment Operations:
   - Mark prediction as paid
   - Handle non-existent predictions

### Test Output

The tests provide detailed output about the data being tested, including:
- Number of predictions found
- Sample payment data
- Date ranges being tested
- Notification attempts

This helps verify that the tests are working with actual data from the database.

## CLI Commands

The application also provides CLI commands for common operations:

1. Check future payments:
```bash
python backend/cli.py check-future-payments --days-ahead 7
```

2. Update monthly payments:
```bash
python backend/cli.py update-monthly-payments --month 12 --year 2024
```

3. Verify notification service:
```bash
python backend/cli.py verify-notification-service
```

## Development

- The backend uses FastAPI for the API framework
- SQLAlchemy for database operations
- Telethon for Telegram notifications
- Pytest for testing

### Project Structure

```
backend/
├── app/
│   ├── api/            # API endpoints
│   ├── core/           # Core configuration
│   ├── crud/           # Database operations
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   └── services/       # Business logic services
├── tests/              # Test suite
├── cli.py             # CLI interface
└── requirements.txt   # Dependencies
