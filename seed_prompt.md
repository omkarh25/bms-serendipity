Abstract:
I need a simple webapp which assists working with tabular data, by providing MVC functionality.

The app flow is as follows:
1. Model: Shows data in tabular format with options to filter and sort data. Dropdown for selecting the table.
2. View: Process and represent data for givel role. Eg: CA, Budget Analyst, Owner. 
3. Controller: Provides buttons execute processes llike add employee, add transaction, add account, add chit, add loan, add income, add expense etc.,

Implementation Case:
I have an Excel file with accounts present, transaction past and freedom future sheets.

Model: Refer to Index Kaas.md for data schema.
View: CA, Budget Analyst, Owner. 

Controller: 
a. Add transaction: Add unplanned transaction to Transaction Past sheet with all fields, Add frequency based entries to future sheet if its a recurring transaction, Add updates to relevant accounts in Accounts Present sheet
b. Add new account: Used incase of using account sheet as entry point. Useful in adding new chits, loans, EMI's, etc.
c. Add single future entry: Add single future entry to Freedom Future sheet with all fields, Add updates to relevant accounts in Accounts Present sheet
f. Process future transactions: Date based for credits and checkbox tick based for bank and cash payments

View:
a. Generate daily report in prescribed format
b. Generate view components based on role using pre-defined templates
c. Need view for CA template, Owner template, Budget Analyst template

User Flow:
1. User is given a dropdown to select the database.
2. User is has 3 tabs: Model, View and Controller. The selected tab is highlighted and that component is loaded.
3. If User is on Model tab, User can filter and sort data. User can select the table from dropdown at the top of the component.
4. If User is on View tab, User can see the data in prescribed format for his role.
5. If User is on Controller tab, User is given buttons to execute processes like add employee, add transaction, add account, add chit, add loan, add income, add expense etc.,

