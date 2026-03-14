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