import os
import sys

# Ensure the backend directory is on the Python path so imports like
# `import database` and `import cashback` work from the backend source tree.
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(root, "backend"))

from asgiref.wsgi import AsgiToWsgi
from main import app

application = AsgiToWsgi(app)
