"""Script to run ICICI transactions table migration."""

import logging
from create_icici_transactions import create_icici_transactions_table

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting ICICI transactions table migration...")
    create_icici_transactions_table()
    logger.info("ICICI transactions table migration completed successfully")
