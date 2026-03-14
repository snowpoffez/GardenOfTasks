from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

# Load local .env file (Vercel CLI also handles this automatically)
load_dotenv()

app = FastAPI()

# Initialize Gemini Client (Uses GEMINI_API_KEY from environment)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class AssignmentRequest(BaseModel):
    text: str

@app.get("/api/health")
def health():
    return {"status": "The garden is breathing!"}

@app.post("/api/germinate")
async def germinate(request: AssignmentRequest):
    try:
        prompt = f"Break this assignment into 5 nature-themed tasks with XP: {request.text}"
        
        # Using the 2026 standard Gemini 3 model
        response = client.models.generate_content(
            model="gemini-3-flash-preview", 
            contents=prompt
        )
        return {"quests": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))