import asyncio
from telethon import TelegramClient
import os
from app.core.config import settings

async def authorize_telegram():
    """
    Script to authorize Telegram client and create a session file.
    """
    print("Starting Telegram authorization process...")
    
    try:
        # Create the client
        client = TelegramClient(
            'notification_sender',
            settings.TELEGRAM_API_ID,
            settings.TELEGRAM_API_HASH
        )
        
        print("Connecting to Telegram...")
        await client.connect()
        
        if not await client.is_user_authorized():
            print("\nSending code request...")
            await client.send_code_request(settings.TELEGRAM_PHONE_NUMBER)
            
            # Get the verification code from user input
            code = input('\nEnter the code you received: ')
            
            print("\nSigning in...")
            await client.sign_in(settings.TELEGRAM_PHONE_NUMBER, code)
            
            print("\nAuthorization successful!")
            print("Session file has been created as 'notification_sender.session'")
        else:
            print("\nAlready authorized!")
            
    except Exception as e:
        print(f"\nError during authorization: {str(e)}")
    finally:
        if client:
            await client.disconnect()
            print("\nDisconnected from Telegram")

if __name__ == '__main__':
    asyncio.run(authorize_telegram())
