import logging
import os

from fastapi.staticfiles import StaticFiles

# Define possible paths to the dist directory
base_dir = os.path.dirname(__file__)
possible_dist_paths = [
    os.path.abspath(os.path.join(base_dir, "client", "dist")), # in prod
    os.path.abspath(os.path.join(base_dir, "..", "client", "dist")),  # in dev
]

dist_dir = None

# Try each possible path
for path in possible_dist_paths:
    print(f"Looking for dist directory at: {path}")
    logging.info(f"Checking dist directory path: {path}")
    if os.path.isdir(path):
        dist_dir = path
        break

if not dist_dir:
    logging.error("Static frontend build not found in any of the expected locations.")
    raise RuntimeError(
        "Static frontend build not found. Please run `npm run build` in the client directory."
    )

PipecatPrebuiltUI = StaticFiles(directory=dist_dir, html=True)