1. Telegram communication
2. Upload bank statements in xls and pdf formats
3. Auto reconciliation
4. Option to reconcile bank account balances in controller by providing justfication transactions
5. Sync descriptions from bank statements to transactions, future transactions
6. Improve Views for roles

@/OpTransactionHistoryTpr24-11-2024.xls This is one of my bank statement format from ICICI bank. 
I need a way in controller to upload this file and extract transactions from it.
1. apply crud to add this to that particular account table based on the pre existing data for that account. , if any.
2. 

3. Compare the transactions with existing transactions and create a automatching transactions based on

User story:
1. In controller page there should be a button for "Upload Bank Statement"
2. This should open a file uploader dialog.
3. User can upload the file and the file will be uploaded to the server.
4. The file will be processed based on the existing transactions and only update the missing transactions from the uploaded statements. It should show user how many transactions are updated and how many are new.

5. User should have a button to "Reconcile" from the dropdowm for each supported bank.
6. The system should reconcile with the existing transactions table and Give interactive stats about how many transactions are reconciled and how many are not reconciled.


LIst of banks supported:
ICICI_090: Use the provided excel format to understand the data format and save it to the existing db with table name as ICICI_Savings_Transactions. Make sure the read the existing transactions table schema before deciding the processing and schema for this new table
SBI_Savings: Yet to be implemented

Ask any relevant after looking at the xls file provided @/OpTransactionHistoryTpr24-11-2024.xls and kaas.db file.