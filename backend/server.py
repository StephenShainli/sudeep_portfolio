"""
Portfolio backend server (Flask).
Serves the single-page frontend and exposes JSON APIs for:
- contact form submissions (saved to SQLite)
- visitor counter
"""

from __future__ import annotations

import os

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from .database import (
    add_contact,
    get_all_contacts,
    get_visitor_count,
    increment_visitor_count,
    init_database,
)


def create_app() -> Flask:
    app = Flask(__name__, static_folder="static", template_folder="templates")
    CORS(app)
    init_database()

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/admin")
    def admin_page():
        return render_template("admin.html")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "running", "message": "Portfolio API"})

    @app.post("/api/visit")
    def record_visit():
        try:
            count = increment_visitor_count()
            return jsonify({"success": True, "count": count})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.get("/api/visitors")
    def visitors():
        try:
            count = get_visitor_count()
            return jsonify({"success": True, "count": count})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.post("/api/contact")
    def submit_contact():
        try:
            data = request.get_json(silent=True) or {}
            name = (data.get("name") or "").strip()
            email = (data.get("email") or "").strip()
            message = (data.get("message") or "").strip()

            if not name:
                return jsonify({"success": False, "error": "Name is required"}), 400
            if not email:
                return jsonify({"success": False, "error": "Email is required"}), 400
            if not message:
                return jsonify({"success": False, "error": "Message is required"}), 400
            if "@" not in email or "." not in email:
                return jsonify({"success": False, "error": "Invalid email address"}), 400

            ok = add_contact(name, email, message)
            if not ok:
                return jsonify({"success": False, "error": "Failed to save message"}), 500

            return jsonify({"success": True, "message": "Message received!"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.get("/api/contacts")
    def contacts():
        try:
            contacts = get_all_contacts()
            return jsonify({"success": True, "contacts": contacts, "total": len(contacts)})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

