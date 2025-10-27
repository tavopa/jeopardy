from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import asyncio
from datetime import datetime
import os
import random

# Database setup
# Use environment variable or default to data directory
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/jeopardy.db")

# Ensure data directory exists
os.makedirs("./data", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    score = Column(Integer, default=0)
    is_host = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_answer = Column(String)
    is_active = Column(Boolean, default=False)

class UserAnswer(Base):
    __tablename__ = "user_answers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    question_id = Column(Integer)
    selected_answer = Column(String)
    is_correct = Column(Boolean)
    answered_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    is_host: bool = False

class UserResponse(BaseModel):
    id: int
    name: str
    score: int
    is_host: bool

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class AnswerSubmit(BaseModel):
    user_id: int
    question_id: int
    selected_answer: str

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.host_connection: Optional[WebSocket] = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket == self.host_connection:
            self.host_connection = None

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        print(f"Broadcasting to {len(self.active_connections)} connections")
        for i, connection in enumerate(self.active_connections):
            try:
                await connection.send_text(message)
                print(f"Message sent to connection {i}")
            except Exception as e:
                print(f"Error sending to connection {i}: {e}")
                pass

    async def broadcast_to_host(self, message: str):
        if self.host_connection:
            try:
                await self.host_connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Game state
game_state = {
    "is_registration_open": False,
    "is_game_started": False,
    "is_question_active": False,
    "current_question": None,
    "time_remaining": 0,
    "question_timer": 0
}

# Load questions from file
def load_questions():
    questions = []
    try:
        with open("questions.txt", "r", encoding="utf-8") as f:
            content = f.read()
            question_blocks = content.split("\n\n")
            
            for block in question_blocks:
                if not block.strip():
                    continue
                    
                lines = block.strip().split("\n")
                if len(lines) >= 6:
                    question_text = lines[0]
                    option_a = lines[1].replace("A) ", "")
                    option_b = lines[2].replace("B) ", "")
                    option_c = lines[3].replace("C) ", "")
                    option_d = lines[4].replace("D) ", "")
                    correct_answer = lines[5].replace("correcta:", "")
                    
                    questions.append({
                        "question_text": question_text,
                        "option_a": option_a,
                        "option_b": option_b,
                        "option_c": option_c,
                        "option_d": option_d,
                        "correct_answer": correct_answer
                    })
    except Exception as e:
        print(f"Error loading questions: {e}")
    
    return questions

# Database functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_user(db: Session, user: UserCreate):
    db_user = User(name=user.name, is_host=user.is_host)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session):
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def update_user_score(db: Session, user_id: int, score: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.score = score
        db.commit()
    return user

def save_question(db: Session, question_data: dict):
    question = Question(**question_data)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def get_active_question(db: Session):
    return db.query(Question).filter(Question.is_active == True).first()

def set_question_inactive(db: Session):
    print("Setting current question as inactive")
    result = db.query(Question).filter(Question.is_active == True).update({"is_active": False})
    print(f"Updated {result} questions to inactive")
    db.commit()

def save_user_answer(db: Session, user_id: int, question_id: int, selected_answer: str, is_correct: bool):
    answer = UserAnswer(
        user_id=user_id,
        question_id=question_id,
        selected_answer=selected_answer,
        is_correct=is_correct
    )
    db.add(answer)
    db.commit()
    return answer

def get_user_answers(db: Session, user_id: int):
    return db.query(UserAnswer).filter(UserAnswer.user_id == user_id).all()

# API Routes
@app.get("/")
async def root():
    return {"message": "Jeopardy Trivia API"}

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Reject new registrations if registration is closed
    if not game_state.get("is_registration_open", False):
        raise HTTPException(status_code=403, detail="Registration is closed")
    db_user = create_user(db, user)
    return UserResponse(
        id=db_user.id,
        name=db_user.name,
        score=db_user.score,
        is_host=db_user.is_host
    )

@app.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    users = get_users(db)
    return [UserResponse(
        id=user.id,
        name=user.name,
        score=user.score,
        is_host=user.is_host
    ) for user in users]

@app.post("/start-registration")
async def start_registration():
    game_state["is_registration_open"] = True
    await manager.broadcast(json.dumps({
        "type": "registration_started",
        "message": "Registration is now open!"
    }))
    return {"message": "Registration started"}

@app.post("/start-game")
async def start_game(db: Session = Depends(get_db)):
    game_state["is_registration_open"] = False
    game_state["is_game_started"] = True
    game_state["is_question_active"] = False
    game_state["current_question"] = None
    game_state["question_timer"] = 0
    
    # Reset previous game data
    try:
        # Clear previous answers and reset active state
        db.query(UserAnswer).delete()
        db.query(Question).update({"is_active": False})
        # Reset user scores
        db.query(User).update({User.score: 0})
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error resetting game data: {e}")

    # Note: Questions are now managed through the admin panel
    # and persist in the database
    
    await manager.broadcast(json.dumps({
        "type": "game_started",
        "message": "Game is starting in 5 seconds!",
        "countdown": 5
    }))
    
    return {"message": "Game started"}

@app.post("/start-first-question")
async def start_first_question(db: Session = Depends(get_db)):
    # Get all available questions and select randomly
    available_questions = (
        db.query(Question)
        .filter(Question.is_active == False)
        .all()
    )
    
    if not available_questions:
        return {"error": "No questions available"}
    
    # Select a random question
    first_q = random.choice(available_questions)
    
    if first_q:
        first_q.is_active = True
        db.commit()
        
        game_state["current_question"] = first_q.id
        game_state["is_question_active"] = True
        game_state["question_timer"] = 15
        
        question_data = QuestionResponse(
            id=first_q.id,
            question_text=first_q.question_text,
            option_a=first_q.option_a,
            option_b=first_q.option_b,
            option_c=first_q.option_c,
            option_d=first_q.option_d
        )
        
        message = json.dumps({
            "type": "new_question",
            "question": question_data.dict(),
            "timer": 15
        })
        print(f"Broadcasting first question: {message}")
        await manager.broadcast(message)
        
        return {"message": "First question started"}
    else:
        return {"error": "No questions available"}

@app.post("/next-question")
async def next_question(db: Session = Depends(get_db)):
    print("Next question requested")
    # Set current question as inactive
    set_question_inactive(db)
    
    # Get all questions to debug
    all_questions = db.query(Question).all()
    print(f"Total questions in DB: {len(all_questions)}")
    for q in all_questions:
        print(f"Question {q.id}: active={q.is_active}, text={q.question_text[:50]}...")
    
    # Get all available questions and select randomly
    available_questions = (
        db.query(Question)
        .filter(Question.is_active == False)
        .all()
    )
    
    print(f"Available questions: {len(available_questions)}")
    
    next_q = None
    if available_questions:
        # Select a random question from available ones
        next_q = random.choice(available_questions)
    
    print(f"Found next question: {next_q}")
    if next_q:
        next_q.is_active = True
        db.commit()
        
        game_state["current_question"] = next_q.id
        game_state["is_question_active"] = True
        game_state["question_timer"] = 15
        
        question_data = QuestionResponse(
            id=next_q.id,
            question_text=next_q.question_text,
            option_a=next_q.option_a,
            option_b=next_q.option_b,
            option_c=next_q.option_c,
            option_d=next_q.option_d
        )
        
        message = json.dumps({
            "type": "new_question",
            "question": question_data.dict(),
            "timer": 15
        })
        print(f"Broadcasting next question: {message}")
        await manager.broadcast(message)
        
        return {"message": "Next question started"}
    else:
        # Game finished
        game_state["is_question_active"] = False
        game_state["is_game_started"] = False
        users = get_users(db)
        leaderboard = sorted(users, key=lambda x: x.score, reverse=True)
        
        await manager.broadcast(json.dumps({
            "type": "game_finished",
            "leaderboard": [UserResponse(
                id=user.id,
                name=user.name,
                score=user.score,
                is_host=user.is_host
            ).dict() for user in leaderboard]
        }))
        
        return {"message": "Game finished"}

@app.post("/submit-answer")
async def submit_answer(answer: AnswerSubmit, db: Session = Depends(get_db)):
    if not game_state["is_question_active"]:
        raise HTTPException(status_code=400, detail="No active question")
    
    # Get the active question
    question = get_active_question(db)
    if not question:
        raise HTTPException(status_code=400, detail="No active question")
    
    # Check if answer is correct
    is_correct = answer.selected_answer == question.correct_answer
    
    # Save the answer
    save_user_answer(db, answer.user_id, answer.question_id, answer.selected_answer, is_correct)
    
    # Update user score
    user = get_user_by_id(db, answer.user_id)
    if user and is_correct:
        user.score += 1
        db.commit()
    
    return {"correct": is_correct, "score": user.score if user else 0}

# Question Management Endpoints
@app.get("/questions")
async def get_all_questions(db: Session = Depends(get_db)):
    """Get all questions from database (for admin panel)"""
    questions = db.query(Question).all()
    return [QuestionResponse(
        id=q.id,
        question_text=q.question_text,
        option_a=q.option_a,
        option_b=q.option_b,
        option_c=q.option_c,
        option_d=q.option_d
    ) for q in questions]

@app.post("/questions")
async def create_question(question: dict, db: Session = Depends(get_db)):
    """Create a new question"""
    try:
        new_question = Question(
            question_text=question['question_text'],
            option_a=question['option_a'],
            option_b=question['option_b'],
            option_c=question['option_c'],
            option_d=question['option_d'],
            correct_answer=question['correct_answer'],
            is_active=False
        )
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        return {"message": "Question created", "id": new_question.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/questions/{question_id}")
async def update_question(question_id: int, question: dict, db: Session = Depends(get_db)):
    """Update an existing question"""
    try:
        db_question = db.query(Question).filter(Question.id == question_id).first()
        if not db_question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        db_question.question_text = question['question_text']
        db_question.option_a = question['option_a']
        db_question.option_b = question['option_b']
        db_question.option_c = question['option_c']
        db_question.option_d = question['option_d']
        db_question.correct_answer = question['correct_answer']
        
        db.commit()
        return {"message": "Question updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/questions/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    """Delete a question"""
    try:
        db_question = db.query(Question).filter(Question.id == question_id).first()
        if not db_question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        db.delete(db_question)
        db.commit()
        return {"message": "Question deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "host_connect":
                manager.host_connection = websocket
                await manager.send_personal_message(json.dumps({
                    "type": "host_confirmed",
                    "message": "You are now the host"
                }), websocket)
            
            elif message.get("type") == "get_game_state":
                await manager.send_personal_message(json.dumps({
                    "type": "game_state",
                    "state": game_state
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
