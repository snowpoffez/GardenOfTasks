from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import psycopg
import os
from dotenv import load_dotenv
from .database import init_db, create_user, login_user, create_task, delete_task, get_user_tasks, create_daily, delete_daily, get_user_dailies, update_daily_partial, update_task_partial

# Debug mode for saving API resources during development
DEBUG_MODE = False # False in production to ensure full functionality

# Load local .env file (Vercel CLI also handles this automatically)
load_dotenv(".env.local")

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

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

class TaskUpdate(BaseModel):
    task_name: str | None = None
    description: str | None = None
    xp: int | None = None
    status: str | None = None

class DailyUpdate(BaseModel):
    task_name: str | None = None
    description: str | None = None
    xp: int | None = None
    status: str | None = None

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
            You are a helpful study assistant that breaks assignments into small, actionable steps.

            Convert this assignment into a list of clear tasks: "{request.text}"

            Rules:
            - Each task must be a single, concrete action a student can complete in one sitting (e.g. "Write 3 bullet points summarizing Chapter 2", not "Research the topic")
            - Tasks should build on each other in logical order — earlier tasks feed into later ones
            - Task names should be short, nature-themed, and energetic (e.g. "Plant the Seed", "Clear the Path")
            - Descriptions must be specific and tell the student exactly what to do and what the result looks like when done
            - XP should reflect effort: 10-30 for quick tasks (under 10 min), 40-60 for medium (10-30 min), 70-100 for hard (30+ min)
            - Aim for as many tasks as you see fit depending on the complexity of the assignment, but make sure to always follow the principle of making it clear and actionable for the student.
            
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
                model="gemini-3.1-flash-lite-preview", 
                contents=prompt
            )

            raw_text = response.text or response.candidates[0].content.parts[0].text

            cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()

            import json
            quests_list = json.loads(cleaned_text)

            return {"quests": quests_list}
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

@app.get("/api/check-user/{username}")

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

@app.post("/api/dailies/createdaily")
def create_daily_route(task: TaskCreate): # Reusing TaskCreate schema since fields match
    try:
        return create_daily(task.user_id, task.task_name, task.description, task.xp, task.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not create daily")

@app.delete("/api/dailies/{daily_id}")
def delete_daily_route(daily_id: int):
    try:
        return delete_daily(daily_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not delete daily")

@app.get("/api/dailies/{user_id}")
def get_user_dailies_route(user_id: int):
    try:
        return get_user_dailies(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.patch("/api/dailies/{daily_id}")
def patch_daily_route(daily_id: int, payload: DailyUpdate):
    # Convert Pydantic model to a dict, excluding fields that are None
    updates = payload.model_dump(exclude_none=True)
    
    try:
        return update_daily_partial(daily_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.patch("/api/tasks/{task_id}")
def patch_task_route(task_id: int, payload: TaskUpdate):
    # Filter out any fields that weren't sent (None)
    updates = payload.model_dump(exclude_none=True)
    
    try:
        return update_task_partial(task_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")