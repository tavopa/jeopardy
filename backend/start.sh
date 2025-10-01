#!/bin/bash

# Initialize database with sample questions if empty
python init_db.py

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload

