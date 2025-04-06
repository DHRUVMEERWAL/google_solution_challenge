import psutil
import subprocess
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS (adjust origin as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# List of known screen recorders
screen_recorders = [
    "obs", "quicktime", "screenflick", "snagit", "bandicam", "camtasia", "screenflow"
]

def detect_active_screen_recording():
    # Step 1: Check running processes
    for process in psutil.process_iter(attrs=['pid', 'name']):
        try:
            process_name = process.info['name'].lower()
            if any(recorder in process_name for recorder in screen_recorders):
                return {
                    "status": "blocked",
                    "reason": f"{process_name} is running"
                }
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # Step 2: Check GPU activity (macOS-specific)
    try:
        result = subprocess.run(["ioreg", "-l"], capture_output=True, text=True)
        for keyword in ["IOScreenCapture", "AGXMetal"]:
            if f'"{keyword}" = Yes' in result.stdout:
                return {
                    "status": "blocked",
                    "reason": f"GPU screen recording detected via {keyword}"
                }
    except Exception as e:
        return {
            "status": "error",
            "reason": f"Failed to check GPU: {str(e)}"
        }

    # Default: no screen recording detected
    return {
        "status": "ok",
        "reason": "No screen recording detected"
    }

@app.get("/check")
def check_screen_recording():
    result = detect_active_screen_recording()
    return JSONResponse(content=result)
