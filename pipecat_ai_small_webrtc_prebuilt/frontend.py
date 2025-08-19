import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

class ConfigurableStaticFiles(StaticFiles):
    """StaticFiles handler that can inject config into HTML files."""
    
    def __init__(self, directory: str, config: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(directory=directory, **kwargs)
        self.config = config or {}
    
    async def __call__(self, scope, receive, send):
        """Override to handle config injection for HTML files."""
        if scope["type"] == "http":
            request = Request(scope, receive)
            path = request.url.path
            
            # Check if this is an HTML file request
            if path.endswith('.html') or path == '/' or path == '':
                # Try to serve the HTML file with config injection
                try:
                    html_content = await self._get_html_with_config(path)
                    if html_content:
                        response = HTMLResponse(content=html_content)
                        await response(scope, receive, send)
                        return
                except Exception as e:
                    logging.warning(f"Failed to inject config into HTML: {e}")
                    # Fall back to normal static file serving
        
        # Fall back to normal static file serving
        await super().__call__(scope, receive, send)
    
    async def _get_html_with_config(self, path: str) -> Optional[str]:
        """Get HTML content with config injected."""
        # Normalize path
        if path in ['/', '']:
            path = '/index.html'
        
        # Remove leading slash for file system path
        file_path = path.lstrip('/')
        if not file_path:
            file_path = 'index.html'
        
        # Construct full file path
        full_path = Path(self.directory) / file_path
        
        if not full_path.exists() or not full_path.is_file():
            return None
        
        # Read the HTML file
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except Exception as e:
            logging.error(f"Failed to read HTML file {full_path}: {e}")
            return None
        
        # Perform template replacement
        return self._inject_config(html_content)
    
    def _inject_config(self, html_content: str) -> str:
        """Inject config into HTML content."""
        if not self.config:
            return html_content
        
        # Serialize config to JSON
        config_json = json.dumps(self.config, default=str)
        
        # Pass config as data string
        return html_content.replace(
            '<div id="root"></div>', 
            f'<div id="root" data-config="{config_json}"></div>'
        )


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


def SmallWebRTCPrebuiltUI(config: Optional[Dict[str, Any]] = None):
    """Factory function to create a configurable static files handler."""
    return ConfigurableStaticFiles(directory=dist_dir, html=True, config=config)