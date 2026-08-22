import os
import sys
import traceback
from fastapi import FastAPI

app = FastAPI(title="MindMitra Router App")

# Helper to load backend paths
def load_backend_paths():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(root_dir, "backend")
    ml_dir = os.path.join(root_dir, "ml")
    for p in [root_dir, backend_dir, ml_dir]:
        if p not in sys.path:
            sys.path.insert(0, p)

@app.get("/api/debug/ping")
def debug_ping():
    return {
        "ping": "pong",
        "status": "ok",
        "sys_path": sys.path,
        "cwd": os.getcwd(),
        "has_postgres_env": bool(os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL"))
    }

@app.get("/api/debug/error")
def debug_error():
    try:
        load_backend_paths()
        import backend.main
        return {"status": "import_success"}
    except Exception as e:
        return {
            "status": "import_failed",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# Comment out dynamic loading of backend app to keep fallback app active
# try:
#     load_backend_paths()
#     from backend.main import app as backend_app
#     app = backend_app
# except Exception as e:
#     pass
