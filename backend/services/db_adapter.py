"""
MindMitra - Unified Database Adapter
Supports PostgreSQL (DATABASE_URL / POSTGRES_URL) for production serverless persistence
and SQLite (mindmitra.db) for offline development.
"""

import os
import sys
import logging
import sqlite3
import datetime
from typing import Dict, Any, List, Optional
from contextlib import contextmanager

logger = logging.getLogger("mindmitra.db")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.getenv("DB_FILE", os.path.join(BASE_DIR, "mindmitra.db"))

HAS_POSTGRES = False
if DATABASE_URL:
    try:
        import psycopg2
        import psycopg2.extras
        HAS_POSTGRES = True
        logger.info(f"PostgreSQL configured via DATABASE_URL")
    except ImportError:
        logger.warning("DATABASE_URL provided but psycopg2-binary not installed. Falling back to SQLite.")

class DictRowWrapper:
    """Wraps database rows to support both dict-like key indexing (row['name']) and tuple index (row[0])."""
    def __init__(self, data: dict):
        self._data = data
        self._keys = list(data.keys())

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._data[self._keys[key]]
        return self._data[key]

    def get(self, key, default=None):
        return self._data.get(key, default)

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()

    def __iter__(self):
        return iter(self._data)

    def dict(self):
        return dict(self._data)

class UnifiedCursor:
    """Cursor wrapper translating parameter placeholders and row formats between SQLite and Postgres."""
    def __init__(self, raw_cursor, is_postgres: bool):
        self.cursor = raw_cursor
        self.is_postgres = is_postgres
        self.lastrowid = None

    def execute(self, sql: str, params: tuple = ()):
        formatted_sql = sql
        if self.is_postgres:
            # Replace SQLite '?' placeholders with Postgres '%s'
            formatted_sql = sql.replace("?", "%s")
            # Replace AUTOINCREMENT with SERIAL / IDENTITY
            formatted_sql = formatted_sql.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
            formatted_sql = formatted_sql.replace("BOOLEAN DEFAULT 1", "BOOLEAN DEFAULT TRUE")
            formatted_sql = formatted_sql.replace("BOOLEAN DEFAULT 0", "BOOLEAN DEFAULT FALSE")

            # Append RETURNING id for INSERT queries if not present
            if formatted_sql.strip().upper().startswith("INSERT INTO") and "RETURNING" not in formatted_sql.upper():
                formatted_sql = formatted_sql.rstrip(";") + " RETURNING id;"

        self.cursor.execute(formatted_sql, params or ())
        
        if self.is_postgres:
            if formatted_sql.strip().upper().startswith("INSERT INTO"):
                try:
                    res = self.cursor.fetchone()
                    if res:
                        self.lastrowid = res[0] if isinstance(res, (tuple, list)) else res.get("id")
                except Exception:
                    pass
        else:
            self.lastrowid = getattr(self.cursor, 'lastrowid', None)

        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        if isinstance(row, sqlite3.Row):
            return dict(row)
        if hasattr(row, 'keys') or isinstance(row, dict):
            return dict(row)
        if isinstance(row, (tuple, list)):
            if hasattr(self.cursor, 'description') and self.cursor.description:
                cols = [desc[0] for desc in self.cursor.description]
                return dict(zip(cols, row))
        return row

    def fetchall(self):
        rows = self.cursor.fetchall()
        if not rows:
            return []
        res = []
        for r in rows:
            if isinstance(r, sqlite3.Row):
                res.append(dict(r))
            elif isinstance(r, dict):
                res.append(dict(r))
            elif isinstance(r, (tuple, list)):
                if hasattr(self.cursor, 'description') and self.cursor.description:
                    cols = [desc[0] for desc in self.cursor.description]
                    res.append(dict(zip(cols, r)))
                else:
                    res.append(r)
            else:
                res.append(r)
        return res

class UnifiedConnection:
    def __init__(self, conn, is_postgres: bool):
        self.conn = conn
        self.is_postgres = is_postgres

    def cursor(self):
        if self.is_postgres:
            import psycopg2.extras
            raw_cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        else:
            raw_cur = self.conn.cursor()
        return UnifiedCursor(raw_cur, self.is_postgres)

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            try:
                self.conn.rollback()
            except Exception:
                pass
        else:
            try:
                self.conn.commit()
            except Exception:
                pass
        self.conn.close()

def get_engine_name() -> str:
    return "postgresql" if (HAS_POSTGRES and DATABASE_URL) else "sqlite"

def get_db_connection():
    if HAS_POSTGRES and DATABASE_URL:
        import psycopg2
        # Ensure sslmode=require for cloud Postgres if needed
        conn_url = DATABASE_URL
        if "sslmode" not in conn_url and "localhost" not in conn_url and "127.0.0.1" not in conn_url:
            if "?" in conn_url:
                conn_url += "&sslmode=require"
            else:
                conn_url += "?sslmode=require"
        raw_conn = psycopg2.connect(conn_url)
        return UnifiedConnection(raw_conn, is_postgres=True)
    else:
        # SQLite
        raw_conn = sqlite3.connect(DB_FILE)
        raw_conn.row_factory = sqlite3.Row
        return UnifiedConnection(raw_conn, is_postgres=False)

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        pass
