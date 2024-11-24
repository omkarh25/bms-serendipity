"""
Test cases for main API endpoints using actual kaas.db database.
"""
import pytest
from datetime import datetime, timedelta
from fastapi import status
from app.schemas import FuturePrediction

def test_get_future_predictions(client):
    """Test getting all future predictions from actual database."""
    response = client.get("/api/v1/future/predictions")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # Should have actual data
    
    # Verify payment data structure
    first_payment = data[0]
    required_fields = {"TrNo", "Date", "Amount", "Description", "Paid", 
                      "PaymentMode", "Department", "Category"}
    assert all(field in first_payment for field in required_fields)
    
    # Log some sample data for verification
    print(f"\nFound {len(data)} total predictions")
    print(f"Sample payment: {first_payment}")

def test_get_unpaid_future_predictions(client):
    """Test getting unpaid future predictions from actual database."""
    response = client.get("/api/v1/future/predictions?paid_status=false")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # Should have actual unpaid data
    
    # Verify all returned payments are unpaid
    for payment in data:
        assert payment["Paid"] is False
    
    # Log unpaid payments info
    print(f"\nFound {len(data)} unpaid predictions")
    print(f"Sample unpaid payment: {data[0]}")

def test_get_upcoming_predictions(client):
    """Test getting upcoming payment predictions from actual database."""
    days_ahead = 30  # Look ahead 30 days to ensure we find some data
    response = client.get(f"/api/v1/future/predictions/upcoming?days_ahead={days_ahead}")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, list)
    
    if len(data) > 0:
        # Verify dates are within range
        today = datetime.now().date()
        future_date = today + timedelta(days=days_ahead)
        
        for payment in data:
            payment_date = datetime.fromisoformat(payment["Date"]).date()
            assert today <= payment_date <= future_date
            assert payment["Paid"] is False  # Should only include unpaid
        
        # Log upcoming payments info
        print(f"\nFound {len(data)} upcoming predictions in next {days_ahead} days")
        print(f"Sample upcoming payment: {data[0]}")
    else:
        print(f"\nNo upcoming payments found in next {days_ahead} days")

def test_get_predictions_by_date_range(client):
    """Test getting predictions within a specific date range."""
    # Look at a 3-month range
    start_date = datetime.now().date()
    end_date = start_date + timedelta(days=90)
    
    response = client.get(
        f"/api/v1/future/predictions?start_date={start_date}&end_date={end_date}"
    )
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, list)
    
    if len(data) > 0:
        # Verify dates are within range
        for payment in data:
            payment_date = datetime.fromisoformat(payment["Date"]).date()
            assert start_date <= payment_date <= end_date
        
        # Log date range payments info
        print(f"\nFound {len(data)} predictions between {start_date} and {end_date}")
        print(f"Sample payment in range: {data[0]}")
    else:
        print(f"\nNo payments found between {start_date} and {end_date}")

def test_send_payment_notifications(client, mock_notification_provider, mocker):
    """Test sending payment notifications for actual upcoming payments."""
    # Mock only the notification provider, use real payment data
    mocker.patch(
        "app.api.api_v1.endpoints.notifications.get_notification_provider",
        return_value=mock_notification_provider
    )
    
    days_ahead = 30  # Look ahead 30 days to ensure we find some data
    response = client.post(f"/api/v1/notifications/send-payment-notifications?days_ahead={days_ahead}")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, list)
    
    # Log notification attempts
    print(f"\nAttempted to send notifications for {len(data)} upcoming payments")
    if len(data) > 0:
        print(f"Sample notified payment: {data[0]}")
    
    # Verify notifications were attempted
    assert mock_notification_provider.send_notification.call_count == len(data)

def test_mark_prediction_as_paid(client):
    """Test marking a prediction as paid using actual data."""
    # First get an unpaid prediction
    response = client.get("/api/v1/future/predictions?paid_status=false")
    assert response.status_code == status.HTTP_200_OK
    
    unpaid_payments = response.json()
    if not unpaid_payments:
        pytest.skip("No unpaid payments available for testing")
    
    # Try to mark the first unpaid payment as paid
    tr_no = unpaid_payments[0]["TrNo"]
    mark_response = client.post(f"/api/v1/future/predictions/{tr_no}/mark-paid")
    assert mark_response.status_code == status.HTTP_200_OK
    
    # Verify it was marked as paid
    get_response = client.get(f"/api/v1/future/predictions/{tr_no}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["Paid"] is True
    
    print(f"\nSuccessfully marked payment {tr_no} as paid")
