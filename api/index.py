from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

# Debug mode for saving API resources during development
DEBUG_MODE = True # False in production to ensure full functionality

# Load local .env file (Vercel CLI also handles this automatically)
load_dotenv()

app = FastAPI()

# Initialize Gemini Client using api key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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
            "Task 1: Research the topic and gather relevant information. (XP: 20)",
            "Task 2: Create an outline for the assignment. (XP: 15)",
            "Task 3: Write the introduction and main body. (XP: 30)",
            "Task 4: Edit and proofread the content. (XP: 25)",
            "Task 5: Submit the assignment on time. (XP: 10)"
        ]}
    else:
        try:
            prompt = f"Break this assignment into 5 tasks with XP: {request.text}"
            
            # Using the 2026 standard Gemini 3 model
            response = client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=prompt
            )
            return {"quests": response.text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))