from telethon import TelegramClient
import os
from datetime import datetime, timedelta
from your_database_module import get_next_five_payments  # Replace with your actual database module

# Load environment variables
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
phone_number = os.getenv('TELEGRAM_PHONE_NUMBER')
channel_id = os.getenv('TELEGRAM_CHANNEL_ID')

async def send_notifications():
    client = TelegramClient('session_name', api_id, api_hash)
    await client.start(phone_number)

    # Fetch the next 5 payments from the future table
    payments = get_next_five_payments(datetime.now())

    # Construct the message
    message = "Upcoming Payments:\n" + "\n".join(
        [f"{payment['date']}: {payment['description']} - {payment['amount']}" for payment in payments]
    )

    # Send the message to the specified channel
    await client.send_message(channel_id, message)

    await client.disconnect()

# Flask or FastAPI endpoint
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/send-notifications', methods=['POST'])
def send_notifications_endpoint():
    try:
        import asyncio
        asyncio.run(send_notifications())
        return jsonify({"message": "Notifications sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 