import os

from dotenv import load_dotenv

from app import create_app

load_dotenv()
env_name = os.getenv("FLASK_ENV", "development")
debug_enabled = True if env_name == "development" else False
app = create_app(env_name)

if __name__ == "__main__":
    app.run(debug=debug_enabled)
