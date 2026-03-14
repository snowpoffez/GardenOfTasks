import os
import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

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

def create_user(username: str, password: str):
    """
    Checks for duplicates and creates a new user.
    Returns dict with success, user_id, message or raises HTTPException
    """
    # Basic validation
    if not username or not password:
        raise ValueError("Username and password required")

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # 1. Check if the username is already taken
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if cur.fetchone():
                    raise ValueError("Username already exists")

                # 2. Insert the new user
                cur.execute(
                    "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
                    (username, password)
                )

                # Get the new ID
                new_user_id = cur.fetchone()[0]

                return {
                    "success": True,
                    "user_id": new_user_id,
                    "message": f"User {username} created successfully!"
                }

    except Exception as e:
        # Log the error
        print(f"Registration Error: {e}")
        raise

def login_user(username: str, password: str):
    """
    Authenticates user.
    Returns dict with success, user_id, username, message or raises ValueError
    """
    if not username or not password:
        raise ValueError("Username and password required")

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
                    raise ValueError("Invalid username or password")

                # If successful, return the user_id
                return {
                    "success": True,
                    "user_id": user["id"],
                    "username": user["username"],
                    "message": "Login successful!"
                }

    except psycopg.Error as e:
        print(f"Database error: {e}")
        raise

def create_task(user_id: int, task_name: str, description: str = "No description provided", xp: int = 10, status: str = "todo"):
    """
    Creates a new task.
    Returns dict with success, task_id or raises exception
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Insert the task
                cur.execute(
                    """
                    INSERT INTO tasks (user_id, task_name, description, xp, status)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (user_id, task_name, description, xp, status)
                )

                new_task_id = cur.fetchone()[0]

                return {
                    "success": True,
                    "task_id": new_task_id
                }

    except Exception as e:
        print(f"Error creating task: {e}")
        raise

def delete_task(task_id: int):
    """
    Deletes a task by ID.
    Returns dict with success, message or raises exception
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # Execute the delete command
                cur.execute("DELETE FROM tasks WHERE id = %s", (task_id,))

                # Check if a row was actually deleted
                if cur.rowcount == 0:
                    raise ValueError("Task not found")

                return {"success": True, "message": f"Task {task_id} deleted"}

    except Exception as e:
        print(f"Delete Error: {e}")
        raise

def get_user_tasks(user_id: int):
    """
    Gets all tasks for a user.
    Returns list of task dicts
    """
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                # Get all tasks for that user
                cur.execute(
                    "SELECT id, task_name, description, xp, status FROM tasks WHERE user_id = %s",
                    (user_id,)
                )
                return cur.fetchall()

    except Exception as e:
        print(f"Database error: {e}")
        raise