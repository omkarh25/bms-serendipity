# Developer Guide for Executor

## Introduction
Welcome to the Executor project! This guide is designed to help new developers get up to speed with our coding practices, project structure, and development workflow for this advanced trading system designed for the Indian stock market.

## Project Overview
Executor is a sophisticated, multi-strategy trading system that integrates various components for order execution, market data analysis, and strategy implementation across equity and derivative segments. It supports multiple Indian brokers, implements various trading strategies, processes real-time data, and provides automated trading capabilities with risk management features.

## Getting Started

### Prerequisites
1. Github Project workflow

2. Cursor IDE SetUp (Dev Env SetUp)

3. Create python virtual environment

3. Clone the repository:
   ```
   git clone https://github.com/your-repo/executor.git
   ```
   
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up environment variables (contact senior dev for `.env.example` file)
4. Run GoodMorning scripts
5. Run the Strategy scripts
6. Run the Dashboard scripts
7. Run the GoodEvening scripts
8. Run DailyDB script
9. Run Weekly scripts

## Code Structure
- `Executor/`: Core execution engine and utilities
  - `ExecutorDashBoard/`: User interface for monitoring and control
  - `ExecutorUtils/`: Core utility functions
  - `NSEStrategies/`: Implementation of trading strategies
  - `Scripts/`: Automation scripts for daily operations
- `User/`: User management and dashboard functionalities
- `MarketInfo/`: Market data processing and analysis
- `TestCases/`: Integration and unit tests

## Coding Conventions
1. Use PEP 8 style guide for Python code
2. Use meaningful variable and function names
3. Write docstrings for all functions and classes
4. Keep functions small and focused on a single task
5. Use type hints where possible
6. Write appropriate log messages and set log levels for easy debugging.
7. Refer to existing db schema and chunk the appropriate data to give context to AI chats 
8. Follow existing conventions in the codebase, especially for broker integrations and strategy implementations

## AI Coding guidelines
1. Provide a clear context or set clear context like input data and expected output, function names to be assigned etc., Refer DevPromptTemplates.md for examples
2. Use AIDevGuide.md to provide coding conventions to be used while coding in Claude projects or gpt so that resulting code is consistent and easy to understand.

## Git Workflow
1. Create a new branch for each feature or bug fix
2. Within this branch, Keep commits focused and atomic
3. Write clear, concise commit messages. 
4. Submit pull requests for code review before merging to main

## Testing
1. Write unit tests for new functionality, especially for critical components like order execution and risk management
2. Ensure all tests pass before submitting a pull request
3. Aim for high test coverage, particularly for the core execution engine and strategy implementations
4. Add integration tests for new broker integrations or major feature additions

## Documentation
1. Keep README.md up to date with any new features or changes in project structure
2. Document complex algorithms and decisions, especially for trading strategies and risk management techniques
3. Update this guide as needed, particularly when adding new components or changing the development workflow
4. Maintain clear documentation for each trading strategy in the `NSEStrategies/` directory

## Code Review Process
1. All code changes must be reviewed by at least one other developer
2. Pay special attention to changes in order execution, risk management, and strategy implementation
3. Address all comments and suggestions before merging
4. Ensure new code adheres to the project's coding conventions and maintains overall system integrity

## Deployment
1. Ensure all tests pass in a staging environment before deployment
2. Follow a strict versioning system for releases
3. Maintain a changelog documenting all significant changes
4. Have a rollback plan in place for each deployment

## Troubleshooting
1. Check logs in the `LoggingCenter/` for detailed error information
2. Verify broker API connectivity and credentials
3. Ensure market data feeds are functioning correctly
4. Review recent code changes if issues arise after a new deployment

## Contact
For technical issues or development questions, contact the lead developer at [email@example.com].
For general project inquiries, reach out to the project manager at [pm@example.com].

Remember to always prioritize code quality, maintainability, and collaboration. Given the critical nature of a trading system, pay extra attention to error handling, data integrity, and system reliability. Happy coding!
