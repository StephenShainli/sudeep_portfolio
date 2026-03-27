"""
Database module for the portfolio website.
SQLite stores contact submissions + visitor count.
"""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime
from typing import Any


def _db_path() -> str:
    # Render: use persistent disk mount if provided
    mount = os.environ.get("RENDER_DISK_PATH")  # e.g. "/var/data"
    if mount:
        os.makedirs(mount, exist_ok=True)
        return os.path.join(mount, "portfolio.db")

    # Local/dev: keep DB in ./instance
    base = os.path.dirname(__file__)
    inst = os.path.join(base, "instance")
    os.makedirs(inst, exist_ok=True)
    return os.path.join(inst, "portfolio.db")


DB_PATH = _db_path()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database() -> None:
    conn = _connect()
    cur = conn.cursor()

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
    print(f"DB: {DB_PATH}")

