from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv
from database import init_db, create_user, login_user, create_task, delete_task, get_user_tasks

# Debug mode for saving API resources during development
DEBUG_MODE = True # False in production to ensure full functionality

# Load local .env file (Vercel CLI also handles this automatically)
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Allow local dev and your production URL
    allow_origins=[
        "http://localhost:5173", 
        "https://garden-of-tasks.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client using api key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TaskCreate(BaseModel):
    user_id: int
    task_name: str
    description: str | None = "No description provided"
    xp: int = 10
    status: str = "todo"

class AssignmentRequest(BaseModel):
    text: str

# Initialize database on startup
init_db()

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
def create_user_route(payload: dict = Body(...)):
    """
    Receives username and password from React, 
    checks for duplicates, and creates a new user.
    """
    username = payload.get("username")
    password = payload.get("password")

    try:
        return create_user(username, password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/api/login")
def login_user_route(payload: dict = Body(...)):
    username = payload.get("username")
    password = payload.get("password")

    try:
        return login_user(username, password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/tasks/createtask")
def create_task_route(task: TaskCreate):
    try:
        return create_task(task.user_id, task.task_name, task.description, task.xp, task.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not create task")

@app.delete("/api/tasks/{task_id}")
def delete_task_route(task_id: int):
    try:
        return delete_task(task_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not delete task")

@app.get("/api/tasks/{user_id}")
def get_user_tasks_route(user_id: int):
    try:
        return get_user_tasks(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/check-user/{username}")

def check_username_exists(username: str):
    """
    Checks if a username exists in the users table.
    Returns a dict with the existence status.
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Standard cursor returns results as tuples
                cur.execute(
                    "SELECT id FROM users WHERE username = %s",
                    (username,)
                )
                user = cur.fetchone() # This will be (id,) or None
                
                # Check if user is not None to confirm existence
                return {"exists": user is not None}

    except Exception as e:
        print(f"Database error: {e}")
        raise