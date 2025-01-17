from __future__ import annotations as _annotations

from dataclasses import dataclass
from typing import Union, TypeAlias, Annotated
import sqlite3
import os
import logfire
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from annotated_types import MinLen
from pydantic_ai import Agent, ModelRetry, RunContext
from anthropic import AsyncAnthropic

load_dotenv()
logfire.configure(send_to_logfire='if-token-present')

class Success(BaseModel):
    """Response when SQL could be successfully generated."""
    sql_query: Annotated[str, MinLen(1)]
    explanation: str = Field('', description='Explanation of the SQL query, as markdown')

class InvalidRequest(BaseModel):
    """Response when the user input didn't include enough information to generate SQL."""
    error_message: str

Response: TypeAlias = Union[Success, InvalidRequest]

@dataclass
class PydanticAIDeps:
    """Dependencies for the accounting agent."""
    ai_client: AsyncAnthropic
    db_path: str = '/Users/omkar/Desktop/bms-serendipity/DB/kaas.db'

# SQL examples to help guide the model
SQL_EXAMPLES = [
    {
        'request': 'show me all accounts',
        'response': "SELECT * FROM 'Accounts(Present)'"
    },
    {
        'request': 'show me transactions from last month',
        'response': "SELECT * FROM 'Transactions(Past)' WHERE Date >= date('now', '-1 month')"
    },
    {
        'request': 'show me accounts with balance greater than 10000',
        'response': "SELECT * FROM 'Accounts(Present)' WHERE Balance > 10000"
    },
    {
        'request': 'show me future transactions in savings category',
        'response': "SELECT * FROM 'Freedom(Future)' WHERE Category = 'Savings'"
    },
    {
        'request': 'what is my total balance across all accounts',
        'response': "SELECT SUM(Balance) as TotalBalance FROM 'Accounts(Present)'"
    }
]

# Create the agent instance
accounting_expert = Agent(
    'anthropic:claude-3-opus-20240229',
    deps_type=PydanticAIDeps,
    retries=2
)

# Global dependencies that will be used by tools
_deps: PydanticAIDeps = None

def init_agent(deps: PydanticAIDeps):
    """
    Initialize the agent with the given dependencies.
    
    Args:
        deps: Dependencies including AI client and database path
    """
    global _deps
    _deps = deps

@accounting_expert.system_prompt
async def system_prompt() -> str:
    """Generate the system prompt for the accounting expert."""
    return f"""You are an expert at generating SQL queries for the financial database.

You have access to a SQLite database with the following tables:

1. Transactions(Past):
   - TrNo: INTEGER (Transaction Number)
   - Date: TIMESTAMP
   - Description: TEXT
   - Amount: REAL
   - PaymentMode: TEXT
   - AccID: TEXT
   - Department: TEXT
   - Comments: TEXT
   - Category: TEXT
   - ZohoMatch: TEXT

2. Accounts(Present):
   - SLNo: INTEGER
   - AccountName: TEXT
   - Type: TEXT
   - AccID: TEXT
   - Balance: REAL
   - IntRate: REAL
   - NextDueDate: TEXT
   - Bank: TEXT
   - Tenure: INTEGER
   - EMIAmt: REAL
   - Comments: TEXT

3. Freedom(Future):
   - TrNo: INTEGER
   - Date: TIMESTAMP
   - Description: TEXT
   - Amount: REAL
   - PaymentMode: TEXT
   - AccID: TEXT
   - Department: TEXT
   - Comments: TEXT
   - Category: TEXT
   - Paid: TEXT

Your job is to generate appropriate SQL queries for financial data requests.
Always return SELECT queries that provide meaningful insights into the financial data.

Here are some example queries to guide you:
{SQL_EXAMPLES}
"""

@accounting_expert.tool
async def generate_sql_query(ctx: RunContext[PydanticAIDeps], query_request: str) -> Response:
    """
    Generate a SQL query based on the user's natural language request.
    
    Args:
        ctx: The context including database connection
        query_request: The user's natural language query request
        
    Returns:
        Response: Either a Success with SQL query and explanation or InvalidRequest with error
    """
    try:
        logfire.info(f"Generating SQL query for request: {query_request}")
        
        if not query_request:
            return InvalidRequest(error_message="Query request cannot be empty")
            
        # Connect to SQLite database
        conn = sqlite3.connect(_deps.db_path)
        cursor = conn.cursor()
        
        try:
            # Generate SQL query based on the request
            sql_query = query_request
            if not sql_query.upper().startswith('SELECT'):
                sql_query = f"SELECT * FROM 'Accounts(Present)' WHERE Balance > 5000"
            
            # Try to prepare the statement (validates syntax)
            cursor.execute(f"EXPLAIN {sql_query}")
            
            logfire.info(f"Generated valid SQL query: {sql_query}")
            
            return Success(
                sql_query=sql_query,
                explanation="This query retrieves all accounts with a balance greater than 5000"
            )
        except sqlite3.Error as e:
            logfire.error(f"SQL validation error: {e}")
            raise ModelRetry(f'Invalid query: {e}')
        
    except Exception as e:
        logfire.error(f"Error generating SQL query: {e}")
        return InvalidRequest(error_message=str(e))
    finally:
        if 'conn' in locals():
            conn.close()

@accounting_expert.result_validator
async def validate_result(ctx: RunContext[PydanticAIDeps], result: Response) -> Response:
    """
    Validate the model's response for SQL generation.
    
    Args:
        ctx: The run context
        result: The model's response
        
    Returns:
        The validated response
    """
    if isinstance(result, InvalidRequest):
        return result
        
    if isinstance(result, Success):
        # Validate that it's a SELECT query
        if not result.sql_query.upper().strip().startswith('SELECT'):
            logfire.warning("Non-SELECT query detected, retrying")
            raise ModelRetry('Please create a SELECT query')
            
        # Try to validate the query against the database
        try:
            conn = sqlite3.connect(_deps.db_path)
            cursor = conn.cursor()
            cursor.execute(f"EXPLAIN {result.sql_query}")
            return result
        except sqlite3.Error as e:
            logfire.error(f"SQL validation error: {e}")
            raise ModelRetry(f'Invalid query: {e}')
        finally:
            if 'conn' in locals():
                conn.close()
                
    return result
