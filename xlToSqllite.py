import pandas as pd
from sqlalchemy import create_engine

def excel_to_sqlite(excel_path: str, sqlite_db_path: str, sheet_name: str):
    """Converts an Excel file to a SQLite database table.

    Args:
        excel_path (str): The path to the Excel file.
        sqlite_db_path (str): The path to the SQLite database.
        table_name (str): The name of the table to create in the SQLite database.
    """
    # Load the Excel file into a pandas DataFrame
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    print(df)
    # Create a SQLAlchemy engine
    engine = create_engine(f'sqlite:///{sqlite_db_path}')

    # Write records stored in the DataFrame to a SQL database
    df.to_sql(sheet_name, con=engine, index=False, if_exists='replace')

    print(f"Data from {excel_path} has been successfully loaded into the {sheet_name} table in {sqlite_db_path}")

# Example usage:
# extract all sheets from Kaas-sql.xlsx and load into their respective tables in the sqlite db
excel_to_sqlite('Kaas-sql.xlsx', 'backend/kaas.db', 'Accounts(Present)')
excel_to_sqlite('Kaas-sql.xlsx', 'backend/kaas.db', 'Freedom(Future)')
excel_to_sqlite('Kaas-sql.xlsx', 'backend/kaas.db', 'Transactions(Past)')

