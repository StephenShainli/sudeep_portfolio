"""
Root entrypoint for Render deployment.

This allows:
- Build command: pip install -r requirements.txt
- Start command: gunicorn server:app
with root directory left blank.
"""

from backend.server import app

