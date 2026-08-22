import os
import sys

# Ensure root, backend, and ml are in python module resolution path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
ml_dir = os.path.join(root_dir, "ml")

for p in [root_dir, backend_dir, ml_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.main import app, init_db

# Initialize database schema in Vercel serverless environment
try:
    init_db()
except Exception as e:
    print(f"[Vercel Initialization Notice] {e}")
# Version: 2.0.2 Dual Route Decorators Added

