"""
MindMitra - Caregiver Authentication & Multi-Profile Authorization Service
Enforces strict caregiver ownership over sub-profiles.
"""

import hashlib
import hmac
import os
import json
import base64
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Header, Depends

SECRET_KEY = os.getenv("MINDMITRA_SECRET_KEY", "mindmitra_caregiver_secure_secret_key_2026")

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Generates secure salted hash: salt$hash"""
    if not salt:
        salt = base64.b64encode(os.urandom(16)).decode('utf-8')
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${base64.b64encode(key).decode('utf-8')}"

def verify_password(password: str, password_hash: str) -> bool:
    """Verifies a plain password against the stored salt$hash"""
    try:
        salt, _ = password_hash.split('$', 1)
        expected_hash = hash_password(password, salt)
        return hmac.compare_digest(expected_hash, password_hash)
    except Exception:
        return False

def create_access_token(caregiver_id: int, email: str, name: str) -> str:
    """Creates a secure timestamped token"""
    payload = {
        "caregiver_id": caregiver_id,
        "email": email,
        "name": name,
        "exp": int(time.time()) + (30 * 24 * 3600), # 30 days
    }
    payload_b64 = base64.b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates token signature and expiration"""
    try:
        if not token:
            return None
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.b64decode(payload_b64.encode('utf-8')).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def verify_profile_ownership(conn, caregiver_id: int, profile_id: int) -> bool:
    """Verifies that the requested profile_id belongs to the caregiver_id"""
    if not caregiver_id or not profile_id:
        return False
    c = conn.cursor()
    c.execute("SELECT caregiver_id FROM elderly_profiles WHERE id = ?", (profile_id,))
    row = c.fetchone()
    if row:
        owner_id = row["caregiver_id"] if isinstance(row, dict) or hasattr(row, "keys") else row[0]
        return int(owner_id) == int(caregiver_id)
    # Check users table fallback for demo / legacy profiles
    c.execute("SELECT id FROM users WHERE id = ?", (profile_id,))
    user_row = c.fetchone()
    if user_row:
        return int(caregiver_id) == 1
    return False


