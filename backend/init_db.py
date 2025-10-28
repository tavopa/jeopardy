"""
Script to initialize the database with sample questions if empty
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, Question

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/jeopardy.db")

# Ensure data directory exists
os.makedirs("./data", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Sample questions
sample_questions = [
    {
        "question_text": "¿Cuál es el lenguaje de programación más popular según el índice TIOBE?",
        "option_a": "Python",
        "option_b": "JavaScript",
        "option_c": "Java",
        "option_d": "C++",
        "correct_answer": "A"
    },
    {
        "question_text": "¿Qué significa la sigla API en programación?",
        "option_a": "Application Programming Interface",
        "option_b": "Advanced Programming Integration",
        "option_c": "Automated Program Interface",
        "option_d": "Application Process Integration",
        "correct_answer": "A"
    },
    {
        "question_text": "¿Cuál es el framework de JavaScript desarrollado por Facebook?",
        "option_a": "Angular",
        "option_b": "Vue.js",
        "option_c": "React",
        "option_d": "Svelte",
        "correct_answer": "C"
    },
    {
        "question_text": "¿Qué es Docker?",
        "option_a": "Un sistema operativo",
        "option_b": "Una plataforma de contenedores",
        "option_c": "Un lenguaje de programación",
        "option_d": "Una base de datos",
        "correct_answer": "B"
    },
    {
        "question_text": "¿Qué significa HTML?",
        "option_a": "HyperText Markup Language",
        "option_b": "High Tech Modern Language",
        "option_c": "Home Tool Markup Language",
        "option_d": "Hyperlink and Text Markup Language",
        "correct_answer": "A"
    }
]

# Initialize database
db = SessionLocal()
try:
    # Check if there are already questions
    count = db.query(Question).count()
    
    if count == 0:
        print("Database is empty. Adding sample questions...")
        for q_data in sample_questions:
            question = Question(
                question_text=q_data["question_text"],
                option_a=q_data["option_a"],
                option_b=q_data["option_b"],
                option_c=q_data["option_c"],
                option_d=q_data["option_d"],
                correct_answer=q_data["correct_answer"],
                is_active=False,
                room_id=None  # Global questions, not tied to any specific room
            )
            db.add(question)
        db.commit()
        print(f"Added {len(sample_questions)} sample questions to the database.")
    else:
        print(f"Database already contains {count} questions. No initialization needed.")
except Exception as e:
    print(f"Error initializing database: {e}")
    db.rollback()
finally:
    db.close()

print("Database initialization complete!")

