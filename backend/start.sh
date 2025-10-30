#!/bin/bash

# Initialize database with sample questions if empty
python init_db.py

# Start the application (no reload to preserve in-memory game state)
exec uvicorn main:app --host 0.0.0.0 --port 8000

