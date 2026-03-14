#!/usr/bin/env python3
"""Start the dev server and open the website in your browser."""

import os
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEV_URL = "http://localhost:5173"


def main():
    os.chdir(ROOT)

    # Install dependencies if node_modules is missing
    if not (ROOT / "node_modules").exists():
        print("Installing dependencies...")
        subprocess.run("npm install", cwd=ROOT, shell=True, check=True)
        print("Done.\n")

    print("Starting dev server...")
    proc = subprocess.Popen("npm run dev", cwd=ROOT, shell=True)

    # Wait for server to be ready, then open browser
    time.sleep(2.5)
    webbrowser.open(DEV_URL)
    print(f"Opened {DEV_URL} in your browser.\n")

    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()
        proc.wait()
        print("\nStopped.")


if __name__ == "__main__":
    main()
