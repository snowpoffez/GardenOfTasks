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
                        password TEXT NOT NULL,
                        currency INTEGER DEFAULT 0,
                        xp INTEGER DEFAULT 0,
                        level INTEGER DEFAULT 1
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

                # 3. Dailies table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS dailies (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        task_name TEXT NOT NULL,
                        description TEXT,
                        xp INTEGER DEFAULT 0,
                        status TEXT DEFAULT 'todo',
                        checked BOOLEAN DEFAULT FALSE,
                        accent_color TEXT,
                        repeat_interval TEXT DEFAULT 'Daily',
                        repeat_every INTEGER DEFAULT 1,
                        repeat_unit TEXT DEFAULT 'day',
                        due_date TEXT
                    );
                """)

                cur.execute("""
                    CREATE TABLE IF NOT EXISTS plants (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        name TEXT NOT NULL,
                        stage INTEGER DEFAULT 1
                    );
                """)

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

def create_daily(user_id: int, task_name: str, description: str = "No description provided", xp: int = 10, status: str = "todo"):
    """
    Creates a new daily.
    Returns dict with success, daily_id or raises exception
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO dailies (user_id, task_name, description, xp, status)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (user_id, task_name, description, xp, status)
                )
                new_daily_id = cur.fetchone()[0]
                return {"success": True, "daily_id": new_daily_id}
    except Exception as e:
        print(f"Error creating daily: {e}")
        raise

def delete_daily(daily_id: int):
    """
    Deletes a daily by ID.
    """
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM dailies WHERE id = %s", (daily_id,))
                if cur.rowcount == 0:
                    raise ValueError("Daily not found")
                return {"success": True, "message": f"Daily {daily_id} deleted"}
    except Exception as e:
        print(f"Delete Error: {e}")
        raise

def get_user_dailies(user_id: int):
    """
    Gets all dailies for a user.
    """
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, task_name, description, xp, status FROM dailies WHERE user_id = %s",
                    (user_id,)
                )
                return cur.fetchall()
    except Exception as e:
        print(f"Database error: {e}")
        raise

def update_daily_partial(daily_id: int, updates: dict):
    """
    Dynamically updates parts of a daily.
    'updates' is a dict like {"task_name": "New Name", "xp": 20}
    """
    if not updates:
        return {"message": "No updates provided"}

    # Build the SET part of the SQL query dynamically
    # e.g., "task_name = %s, xp = %s"
    set_clause = ", ".join([f"{column} = %s" for column in updates.keys()])
    values = list(updates.values())
    values.append(daily_id)  # Add ID for the WHERE clause

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE dailies SET {set_clause} WHERE id = %s",
                    values
                )
                
                if cur.rowcount == 0:
                    raise ValueError("Daily not found")
                
                return {"success": True, "message": "Daily updated successfully"}
    except Exception as e:
        print(f"Update Error: {e}")
        raise

def update_task_partial(task_id: int, updates: dict):
    """
    Dynamically updates parts of a task.
    'updates' is a dict like {"status": "completed", "xp": 50}
    """
    if not updates:
        return {"message": "No updates provided"}

    # Dynamically build the SET string: "column1 = %s, column2 = %s"
    set_clause = ", ".join([f"{col} = %s" for col in updates.keys()])
    values = list(updates.values())
    values.append(task_id)

    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE tasks SET {set_clause} WHERE id = %s",
                    values
                )
                
                if cur.rowcount == 0:
                    raise ValueError("Task not found")
                
                return {"success": True, "message": "Task updated successfully"}
    except Exception as e:
        print(f"Update Error: {e}")
        raise

def add_user_currency(user_id: int, amount: int):
    """
    Increments a user's currency by a specific amount.
    Returns the new balance.
    """
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users 
                    SET currency = currency + %s 
                    WHERE id = %s 
                    RETURNING currency
                    """,
                    (amount, user_id)
                )
                
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                
                return {"success": True, "new_balance": result["currency"]}
    except Exception as e:
        print(f"Currency Update Error: {e}")
        raise

def add_user_xp(user_id: int, xp_gain: int):
    """
    Increments a user's total XP by a specific amount.
    """
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users 
                    SET xp = xp + %s 
                    WHERE id = %s 
                    RETURNING xp
                    """,
                    (xp_gain, user_id)
                )
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                
                return {"success": True, "new_xp": result["xp"]}
    except Exception as e:
        print(f"XP Update Error: {e}")
        raise

def level_up_user(user_id: int):
    """
    Resets total_xp to 0 and increments the level by 1.
    """
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users 
                    SET xp = 0, 
                        level = level + 1 
                    WHERE id = %s 
                    RETURNING level
                    """,
                    (user_id,)
                )
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                
                return {
                    "success": True, 
                    "new_level": result["level"],
                    "message": f"Congratulations! You reached Level {result['level']}!"
                }
    except Exception as e:
        print(f"Level Up Error: {e}")
        raise

def get_user_level(user_id: int):
    """Returns the current level of a specific user."""
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT level FROM users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                return result["level"]
    except Exception as e:
        print(f"Error fetching level: {e}")
        raise

def get_user_xp(user_id: int):
    """Returns the current XP of a specific user."""
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT xp FROM users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                return result["xp"]
    except Exception as e:
        print(f"Error fetching XP: {e}")
        raise

def get_user_currency(user_id: int):
    """Returns the current currency balance of a specific user."""
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT currency FROM users WHERE id = %s", (user_id,))
                result = cur.fetchone()
                if not result:
                    raise ValueError("User not found")
                return result["currency"]
    except Exception as e:
        print(f"Error fetching currency: {e}")
        raise

#PLANTS
def create_plant(user_id: int, name: str):
    """Adds a new plant at stage 1 for a specific user."""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO plants (user_id, name, stage) VALUES (%s, %s, 1) RETURNING id",
                    (user_id, name)
                )
                new_plant_id = cur.fetchone()[0]
                return {"success": True, "plant_id": new_plant_id}
    except Exception as e:
        print(f"Error creating plant: {e}")
        raise

def increment_plant_stage(plant_id: int):
    """Increments the growth stage of a plant by 1."""
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE plants SET stage = stage + 1 WHERE id = %s RETURNING stage",
                    (plant_id,)
                )
                result = cur.fetchone()
                if not result:
                    raise ValueError("Plant not found")
                return {"success": True, "new_stage": result["stage"]}
    except Exception as e:
        print(f"Error growing plant: {e}")
        raise

def delete_plant(plant_id: int):
    """Removes a plant from the database."""
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM plants WHERE id = %s", (plant_id,))
                if cur.rowcount == 0:
                    raise ValueError("Plant not found")
                return {"success": True, "message": f"Plant {plant_id} removed"}
    except Exception as e:
        print(f"Delete Plant Error: {e}")
        raise

def get_user_plants(user_id: int):
    """Retrieves all plants belonging to a specific user."""
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, stage FROM plants WHERE user_id = %s",
                    (user_id,)
                )
                return cur.fetchall()
    except Exception as e:
        print(f"Error fetching plants: {e}")
        raise