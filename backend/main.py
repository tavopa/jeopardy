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
    room_id = Column(String, index=True)  # Add room_id to separate players by room
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
    room_id = Column(String, index=True)  # Add room_id to track active questions per room

class UserAnswer(Base):
    __tablename__ = "user_answers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    question_id = Column(Integer)
    selected_answer = Column(String)
    is_correct = Column(Boolean)
    room_id = Column(String, index=True)  # Add room_id to track answers per room
    answered_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    is_host: bool = False
    room_id: str

class UserResponse(BaseModel):
    id: int
    name: str
    score: int
    is_host: bool
    room_id: str

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
    room_id: str

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
        self.active_connections: Dict[str, List[WebSocket]] = {}  # room_id -> connections
        self.host_connections: Dict[str, WebSocket] = {}  # room_id -> host_connection
        self.connection_rooms: Dict[WebSocket, str] = {}  # websocket -> room_id

    async def connect(self, websocket: WebSocket, room_id: str = "default"):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        self.connection_rooms[websocket] = room_id

    def disconnect(self, websocket: WebSocket):
        room_id = self.connection_rooms.get(websocket)
        if room_id:
            if room_id in self.active_connections and websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if room_id in self.host_connections and websocket == self.host_connections[room_id]:
                del self.host_connections[room_id]
            del self.connection_rooms[websocket]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room_id: str = "default"):
        if room_id not in self.active_connections:
            return
        connections = self.active_connections[room_id]
        print(f"Broadcasting to {len(connections)} connections in room {room_id}")
        for i, connection in enumerate(connections):
            try:
                await connection.send_text(message)
                print(f"Message sent to connection {i} in room {room_id}")
            except Exception as e:
                print(f"Error sending to connection {i} in room {room_id}: {e}")
                pass

    async def broadcast_to_host(self, message: str, room_id: str = "default"):
        if room_id in self.host_connections:
            try:
                await self.host_connections[room_id].send_text(message)
            except:
                pass

manager = ConnectionManager()

# Game state per room
game_states: Dict[str, Dict] = {}  # room_id -> game_state

def get_game_state(room_id: str) -> Dict:
    if room_id not in game_states:
        game_states[room_id] = {
            "is_registration_open": False,
            "is_game_started": False,
            "is_question_active": False,
            "current_question": None,
            "time_remaining": 0,
            "question_timer": 0
        }
    return game_states[room_id]

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
    db_user = User(name=user.name, is_host=user.is_host, room_id=user.room_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, room_id: str = None):
    if room_id:
        return db.query(User).filter(User.room_id == room_id).all()
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

def get_active_question(db: Session, room_id: str = None):
    query = db.query(Question).filter(Question.is_active == True)
    if room_id:
        query = query.filter(Question.room_id == room_id)
    return query.first()

def set_question_inactive(db: Session, room_id: str = None):
    print(f"Setting current question as inactive for room {room_id}")
    query = db.query(Question).filter(Question.is_active == True)
    if room_id:
        query = query.filter(Question.room_id == room_id)
    result = query.update({"is_active": False})
    print(f"Updated {result} questions to inactive")
    db.commit()

def save_user_answer(db: Session, user_id: int, question_id: int, selected_answer: str, is_correct: bool, room_id: str):
    answer = UserAnswer(
        user_id=user_id,
        question_id=question_id,
        selected_answer=selected_answer,
        is_correct=is_correct,
        room_id=room_id
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
    # Reject new registrations if registration is closed for this room
    room_game_state = get_game_state(user.room_id)
    if not room_game_state.get("is_registration_open", False):
        raise HTTPException(status_code=403, detail="Registration is closed")
    db_user = create_user(db, user)
    return UserResponse(
        id=db_user.id,
        name=db_user.name,
        score=db_user.score,
        is_host=db_user.is_host,
        room_id=db_user.room_id
    )

@app.get("/users")
async def get_all_users(room_id: str, db: Session = Depends(get_db)):
    users = get_users(db, room_id)
    return [UserResponse(
        id=user.id,
        name=user.name,
        score=user.score,
        is_host=user.is_host,
        room_id=user.room_id
    ) for user in users]

@app.post("/start-registration")
async def start_registration(room_id: str):
    room_game_state = get_game_state(room_id)
    room_game_state["is_registration_open"] = True
    await manager.broadcast(json.dumps({
        "type": "registration_started",
        "message": "Registration is now open!"
    }), room_id)
    return {"message": "Registration started"}

@app.post("/start-game")
async def start_game(room_id: str, db: Session = Depends(get_db)):
    room_game_state = get_game_state(room_id)
    room_game_state["is_registration_open"] = False
    room_game_state["is_game_started"] = True
    room_game_state["is_question_active"] = False
    room_game_state["current_question"] = None
    room_game_state["question_timer"] = 0
    
    # Reset previous game data for this room only
    try:
        # Clear previous answers for this room
        db.query(UserAnswer).filter(UserAnswer.room_id == room_id).delete()
        # Reset active questions for this room
        db.query(Question).filter(Question.room_id == room_id).update({"is_active": False})
        # Reset user scores for this room
        db.query(User).filter(User.room_id == room_id).update({User.score: 0})
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error resetting game data for room {room_id}: {e}")

    # Note: Questions are now managed through the admin panel
    # and persist in the database
    
    await manager.broadcast(json.dumps({
        "type": "game_started",
        "message": "Game is starting in 5 seconds!",
        "countdown": 5
    }), room_id)
    
    return {"message": "Game started"}

@app.post("/start-first-question")
async def start_first_question(room_id: str, db: Session = Depends(get_db)):
    # Get all available questions for this room and select randomly
    # First, check if there are questions assigned to this room
    room_questions = (
        db.query(Question)
        .filter(Question.room_id == room_id, Question.is_active == False)
        .all()
    )
    
    # If no room-specific questions, create copies of global questions for this room
    if not room_questions:
        global_questions = db.query(Question).filter(Question.room_id == None).all()
        if global_questions:
            for q in global_questions:
                room_question = Question(
                    question_text=q.question_text,
                    option_a=q.option_a,
                    option_b=q.option_b,
                    option_c=q.option_c,
                    option_d=q.option_d,
                    correct_answer=q.correct_answer,
                    is_active=False,
                    room_id=room_id
                )
                db.add(room_question)
            db.commit()
            room_questions = (
                db.query(Question)
                .filter(Question.room_id == room_id, Question.is_active == False)
                .all()
            )
    
    if not room_questions:
        return {"error": "No questions available"}
    
    # Select a random question
    first_q = random.choice(room_questions)
    
    if first_q:
        first_q.is_active = True
        db.commit()
        
        room_game_state = get_game_state(room_id)
        room_game_state["current_question"] = first_q.id
        room_game_state["is_question_active"] = True
        room_game_state["question_timer"] = 15
        
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
        print(f"Broadcasting first question for room {room_id}: {message}")
        await manager.broadcast(message, room_id)
        
        return {"message": "First question started"}
    else:
        return {"error": "No questions available"}

@app.post("/next-question")
async def next_question(room_id: str, db: Session = Depends(get_db)):
    print(f"Next question requested for room {room_id}")
    # Set current question as inactive for this room
    set_question_inactive(db, room_id)
    
    # Get all questions for this room to debug
    #all_questions = db.query(Question).filter(Question.room_id == room_id).all()
    all_questions = db.query(Question).filter().all()
    print(f"Total questions in room {room_id}: {len(all_questions)}")
    for q in all_questions:
        print(f"Question {q.id}: active={q.is_active}, text={q.question_text[:50]}...")
    
    # Get all available questions for this room and select randomly
    available_questions = (
        db.query(Question)
        #.filter(Question.room_id == room_id, Question.is_active == False)
        .filter(Question.is_active == False)
        .all()
    )
    
    print(f"Available questions for room {room_id}: {len(available_questions)}")
    
    next_q = None
    if available_questions:
        # Select a random question from available ones
        next_q = random.choice(available_questions)
    
    print(f"Found next question: {next_q}")
    if next_q:
        next_q.is_active = True
        next_q.room_id = room_id  # Assign room_id to the active question
        db.commit()
        
        room_game_state = get_game_state(room_id)
        room_game_state["current_question"] = next_q.id
        room_game_state["is_question_active"] = True
        room_game_state["question_timer"] = 15
        
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
        print(f"Broadcasting next question for room {room_id}: {message}")
        await manager.broadcast(message, room_id)
        
        return {"message": "Next question started"}
    else:
        # Game finished for this room
        room_game_state = get_game_state(room_id)
        room_game_state["is_question_active"] = False
        room_game_state["is_game_started"] = False
        users = get_users(db, room_id)
        leaderboard = sorted(users, key=lambda x: x.score, reverse=True)
        
        await manager.broadcast(json.dumps({
            "type": "game_finished",
            "leaderboard": [UserResponse(
                id=user.id,
                name=user.name,
                score=user.score,
                is_host=user.is_host,
                room_id=user.room_id
            ).dict() for user in leaderboard]
        }), room_id)
        
        return {"message": "Game finished"}

@app.post("/submit-answer")
async def submit_answer(answer: AnswerSubmit, db: Session = Depends(get_db)):
    try:
        # Validate required fields
        if not answer.room_id:
            raise HTTPException(status_code=400, detail="room_id is required")
        if not answer.user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if not answer.question_id:
            raise HTTPException(status_code=400, detail="question_id is required")
        if not answer.selected_answer:
            raise HTTPException(status_code=400, detail="selected_answer is required")
        
        room_game_state = get_game_state(answer.room_id)
        if not room_game_state["is_question_active"]:
            raise HTTPException(status_code=400, detail="No active question for this room")
        
        # Get the active question for this room
        # First try to find question with room_id, then fallback to question_id match
        question = get_active_question(db, answer.room_id)
        
        # If no question found by room_id, try to find by question_id and room_id in state
        if not question:
            question = db.query(Question).filter(
                Question.id == answer.question_id,
                Question.is_active == True
            ).first()
            
            # If found and doesn't have room_id, assign it
            if question and not question.room_id:
                question.room_id = answer.room_id
                db.commit()
        
        if not question:
            raise HTTPException(status_code=400, detail=f"No active question found for room {answer.room_id} (question_id: {answer.question_id})")
        
        # Verify the question_id matches
        if question.id != answer.question_id:
            raise HTTPException(status_code=400, detail=f"Question ID mismatch: expected {answer.question_id}, found {question.id}")
        
        # Check if answer is correct
        is_correct = answer.selected_answer == question.correct_answer
        
        # Save the answer
        save_user_answer(db, answer.user_id, answer.question_id, answer.selected_answer, is_correct, answer.room_id)
        
        # Update user score
        user = get_user_by_id(db, answer.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if is_correct:
            user.score += 1
            db.commit()
        
        return {"correct": is_correct, "score": user.score}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in submit-answer: {e}")
        raise HTTPException(status_code=400, detail=f"Error processing answer: {str(e)}")

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
async def websocket_endpoint(websocket: WebSocket, room_id: str = "default"):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "host_connect":
                manager.host_connections[room_id] = websocket
                await manager.send_personal_message(json.dumps({
                    "type": "host_confirmed",
                    "message": "You are now the host"
                }), websocket)
            
            elif message.get("type") == "get_game_state":
                room_game_state = get_game_state(room_id)
                await manager.send_personal_message(json.dumps({
                    "type": "game_state",
                    "state": room_game_state
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
