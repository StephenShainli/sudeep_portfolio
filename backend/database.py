"""
Database module for the portfolio website.

Production: PostgreSQL (when DATABASE_URL is set)
Local/dev: SQLite fallback
"""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime
from typing import Any

import psycopg2
from psycopg2.extras import RealDictCursor


def _db_path() -> str:
    # Local/dev: keep SQLite DB in ./instance
    base = os.path.dirname(__file__)
    inst = os.path.join(base, "instance")
    os.makedirs(inst, exist_ok=True)
    return os.path.join(inst, "portfolio.db")


DB_PATH = _db_path()
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
USING_POSTGRES = bool(DATABASE_URL)


def _connect():
    if USING_POSTGRES:
        # Render/Supabase/Neon URLs can be postgres://, psycopg2 wants postgresql://
        normalized = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(normalized, cursor_factory=RealDictCursor)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database() -> None:
    conn = _connect()
    cur = conn.cursor()

    if USING_POSTGRES:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY,
                visitor_count INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cur.execute(
            """
            INSERT INTO stats (id, visitor_count)
            VALUES (1, 0)
            ON CONFLICT (id) DO NOTHING
            """
        )
    else:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                visitor_count INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cur.execute("INSERT OR IGNORE INTO stats (id, visitor_count) VALUES (1, 0)")

    conn.commit()
    conn.close()


def add_contact(name: str, email: str, message: str) -> bool:
    try:
        conn = _connect()
        cur = conn.cursor()
        if USING_POSTGRES:
            cur.execute(
                """
                INSERT INTO contacts (name, email, message, created_at)
                VALUES (%s, %s, %s, %s)
                """,
                (name, email, message, datetime.now()),
            )
        else:
            cur.execute(
                """
                INSERT INTO contacts (name, email, message, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (name, email, message, datetime.now()),
            )
        conn.commit()
        conn.close()
        return True
    except Exception:
        return False


def get_all_contacts() -> list[dict[str, Any]]:
    conn = _connect()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, email, message, created_at
        FROM contacts
        ORDER BY created_at DESC
        """
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def increment_visitor_count() -> int:
    conn = _connect()
    cur = conn.cursor()
    if USING_POSTGRES:
        cur.execute(
            """
            UPDATE stats
            SET visitor_count = visitor_count + 1,
                last_updated = %s
            WHERE id = 1
            """,
            (datetime.now(),),
        )
        cur.execute("SELECT visitor_count FROM stats WHERE id = 1")
    else:
        cur.execute(
            """
            UPDATE stats
            SET visitor_count = visitor_count + 1,
                last_updated = ?
            WHERE id = 1
            """,
            (datetime.now(),),
        )
        cur.execute("SELECT visitor_count FROM stats WHERE id = 1")
    count = int(cur.fetchone()["visitor_count"])
    conn.commit()
    conn.close()
    return count


def get_visitor_count() -> int:
    conn = _connect()
    cur = conn.cursor()
    cur.execute("SELECT visitor_count FROM stats WHERE id = 1")
    count = int(cur.fetchone()["visitor_count"])
    conn.close()
    return count


if __name__ == "__main__":
    init_database()
    if USING_POSTGRES:
        print("DB: PostgreSQL (DATABASE_URL)")
    else:
        print(f"DB: SQLite at {DB_PATH}")

