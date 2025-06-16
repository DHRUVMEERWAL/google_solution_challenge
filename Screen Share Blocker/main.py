from fastapi import FastAPI
import subprocess
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS (adjust origin as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_screen_sharing_active():
    try:
        result = subprocess.run(
            ["launchctl", "print", "system/com.apple.screensharing"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        if "state = running" in result.stdout.lower():
            return True
    except:
        pass
    return False

def is_airplay_active():
    try:
        result = subprocess.run(
            ["system_profiler", "SPDisplaysDataType"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        if "AirPlay" in result.stdout and "Yes" in result.stdout:
            return True
    except:
        pass
    return False

def is_screen_being_captured():
    try:
        result = subprocess.run(
            "lsof | grep '/dev/ttys'",
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True
        )
        suspicious_processes = ["zoom", "obs", "teams", "skype", "discord"]
        for line in result.stdout.lower().splitlines():
            if any(proc in line for proc in suspicious_processes):
                return True
    except:
        pass
    return False

@app.get("/is_sharing_active")
def check_screen_sharing():
    if (
        is_screen_sharing_active()
        or is_airplay_active()
        or is_screen_being_captured()
    ):
        return {"screen_sharing": True}
    else:
        return {"screen_sharing": False}
