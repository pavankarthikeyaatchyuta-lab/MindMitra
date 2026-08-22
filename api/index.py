import os
import sys
import traceback

# Ensure root, backend, and ml are in python module resolution path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
ml_dir = os.path.join(root_dir, "ml")

for p in [root_dir, backend_dir, ml_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.main import app, init_db
    init_db()
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI(title="MindMitra Diagnostics App")
    tb_str = traceback.format_exc()
    
    @app.get("/{rest_of_path:path}")
    def diagnostics(rest_of_path: str):
        return {
            "status": "startup_failed",
            "error": str(e),
            "traceback": tb_str,
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }
