"""
Main CLI entry point for the application.
Provides command-line access to core functionality.
"""
import typer
from app.cli.commands import app

if __name__ == "__main__":
    app()
