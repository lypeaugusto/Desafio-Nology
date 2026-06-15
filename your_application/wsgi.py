import os
import sys

# Ensure the backend directory is on the Python path so imports like
# `import database` and `import cashback` work from the backend source tree.
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(root, "backend"))

from asgiref.sync import AsyncToSync
from asgiref.sync import sync_to_async

from main import app

# Wrap the FastAPI ASGI app for a WSGI server.
# We use `AsyncToSync` to allow gunicorn's sync workers to call the ASGI app.
application = AsyncToSync(app)
