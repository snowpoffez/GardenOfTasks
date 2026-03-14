from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
import os
import psycopg
from dotenv import load_dotenv

# Debug mode for saving API resources during development
DEBUG_MODE = True # False in production to ensure full functionality

# Load local .env file (Vercel CLI also handles this automatically)
load_dotenv()

app = FastAPI()

DATABASE_URL = os.environ.get("DATABASE_URL")

# Initialize Gemini Client using api key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TaskCreate(BaseModel):
    user_id: int
    task_name: str
    description: str | None = "No description provided"
    xp: int = 10
    status: str = "todo"

def init_db():
    """Sets up Users and Tasks without formal constraints."""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # 1. Users table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    );
                """)

                # 2. Tasks table 
                # user_id is now just a regular integer column
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        task_name TEXT NOT NULL,
                        description TEXT,
                        xp INTEGER DEFAULT 0,
                        status TEXT DEFAULT 'todo'
                    );
                """)
                print("✅ Tables initialized.")
                
    except Exception as e:
        print(f"❌ Initialization failed: {e}")

init_db()

class AssignmentRequest(BaseModel):
    text: str

# Checks that the API is up and running
@app.get("/api/health")
def health():
    return {"status": "The garden is breathing!"}

# Sends text to the Gemini API and returns the generated quests
@app.post("/api/germinate")
async def germinate(request: AssignmentRequest):
    if DEBUG_MODE: 
        return {"quests": [
            {
                "id": 1,
                "task_name": "Gathering Moss",
                "description": "Research 3 primary sources for the history essay.",
                "xp": 50,
                "category": "Research",
                "status": "pending"
            },
            {
                "id": 2,
                "task_name": "Rooting the Narrative",
                "description": "Outline the introductory paragraph.",
                "xp": 30,
                "category": "Drafting",
                "status": "pending"
            }
        ]}
    else:
        try:
            prompt = f"""
            Break the following assignment into any number of nature-themed tasks that you see fit: "History Essay"

            You must return the data strictly as a JSON list of objects.

            Do not include any conversational text, markdown formatting, or backticks.

            Each object must follow this exact schema:



            - "id": An integer starting from 1.

            - "task_name": A creative nature-themed title for the task.

            - "description": A clear instruction on what the user needs to do.

            - "xp": An integer between 10 and 100 based on difficulty.

            - "status": A string that must be exactly "pending".

            Example Output:

            [

            {{"id": 1, "task_name": "Clearing the Brush", "description": "Organize notes", "xp": 20, "status": "pending"}}

            ]

            """
            # Using the 2026 standard Gemini 3 model
            response = client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=prompt
            )
            return {"quests": response.text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/register")
def create_user(payload: dict = Body(...)):
    """
    Receives username and password from React, 
    checks for duplicates, and creates a new user.
    """
    username = payload.get("username")
    password = payload.get("password")

    # Basic validation
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # 1. Check if the username is already taken
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if cur.fetchone():
                    raise HTTPException(status_code=409, detail="Username already exists")

                # 2. Insert the new user
                cur.execute(
                    "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
                    (username, password)
                )
                
                # Get the new ID to send back to React
                new_user_id = cur.fetchone()[0]
                
                return {
                    "success": True,
                    "user_id": new_user_id,
                    "message": f"User {username} created successfully!"
                }

    except Exception as e:
        # Log the error for yourself and send a 500 to the frontend
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/api/login")
def login_user(payload: dict = Body(...)):
    username = payload.get("username")
    password = payload.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    try:
        # Use dict_row so we can access columns by name
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                # Look for the user in the database
                cur.execute(
                    "SELECT id, username, password FROM users WHERE username = %s", 
                    (username,)
                )
                user = cur.fetchone()

                # If user doesn't exist OR password doesn't match
                if not user or user["password"] != password:
                    raise HTTPException(status_code=401, detail="Invalid username or password")

                # If successful, return the user_id so React can save it
                return {
                    "success": True,
                    "user_id": user["id"],
                    "username": user["username"],
                    "message": "Login successful!"
                }

    except psycopg.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/tasks/createtask")

def create_task(task: TaskCreate):
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Insert the task using the user_id provided
                cur.execute(
                    """
                    INSERT INTO tasks (user_id, task_name, description, xp, status) 
                    VALUES (%s, %s, %s, %s, %s) 
                    RETURNING id
                    """,
                    (task.user_id, task.task_name, task.description, task.xp, task.status)
                )
                
                new_task_id = cur.fetchone()[0]
                
                return {
                    "success": True,
                    "task_id": new_task_id
                }

    except Exception as e:
        print(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Could not create task")

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Execute the delete command
                cur.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
                
                # Check if a row was actually deleted
                if cur.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Task not found")
                
                return {"success": True, "message": f"Task {task_id} deleted"}

    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Could not delete task")

@app.get("/api/tasks/{user_id}")
def get_user_tasks(user_id: int):
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                # One single query to get all tasks for that specific ID
                cur.execute(
                    "SELECT id, task_name, description, xp, status FROM tasks WHERE user_id = %s",
                    (user_id,)
                )
                return cur.fetchall()

    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")