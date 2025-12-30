# SmallWebRTC Prebuilt

A simple, ready-to-use client for testing the **SmallWebRTCTransport**.

This prebuilt client provides basic WebRTC functionality and serves as a lightweight tool
to quickly verify transport behavior without needing a custom implementation.

Ideal for development, debugging, and quick prototyping.

---

## 📦 Installation & Usage

If you just want to **use** the prebuilt WebRTC client in your own Python project:

### ✅ Install from PyPI

```bash
pip install pipecat-ai-small-webrtc-prebuilt
```

### 🧰 Example Usage

```python
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from pipecat_ai_small_webrtc_prebuilt.frontend import SmallWebRTCPrebuiltUI

app = FastAPI()

# Mount the frontend at /prebuilt
app.mount("/prebuilt", SmallWebRTCPrebuiltUI)

@app.get("/", include_in_schema=False)
async def root_redirect():
    return RedirectResponse(url="/prebuilt/")
```

### 🧪 Try a Sample App

Want to see it in action? Check out our sample app demonstrating how to use this module:

- 👉 [Sample App](./test/README.md)

## ⌨ Development Quick Start

If you want to work on the prebuilt client itself or use it locally in development:

#### 📋 Prerequisites

- [Node.js](https://nodejs.org/) (for building the client)
- [uv](https://docs.astral.sh/uv/) (recommended for Python dependency management)

#### 🔧 Set Up the Environment

1. **Clone the Repository**

```bash
git clone https://github.com/your-org/small-webrtc-prebuilt.git
cd small-webrtc-prebuilt
```

2. **Build the Client**

The Python package serves a built React client, so you need to build it first:

```bash
cd client
npm install
npm run build
cd ..
```

This creates the `client/dist/` directory that the Python package will serve.

3. **Try the Sample App**

Now you can test the local package with the sample app:

```bash
cd test
uv sync  # Installs dependencies and the local package in editable mode
uv run bot.py
```

Then open http://localhost:7860 in your browser.

## 🚀 Publishing

Publishing is automated via GitHub Actions using trusted publishing (no API tokens needed).

### Prerequisites

1. **Update the version in `pyproject.toml`:**

   ```toml
   version = "2.0.3"
   ```

2. **Create a git tag:**
   ```bash
   git tag -m v2.0.3 v2.0.3
   git push --tags origin
   ```

### Publishing Process

1. **Go to GitHub Actions** in your repository
2. **Select the "publish" workflow**
3. **Click "Run workflow"**
4. **Enter the git tag** (e.g., `v2.0.2`)
5. **Click "Run workflow"**

The workflow will:

- Build the client (React/Vite)
- Bundle it into the Python package
- Build the Python package with version from `pyproject.toml`
- Publish to both Test PyPI and PyPI

### Testing Before Production

To test publishing without creating a release:

1. **Use the `publish-test` workflow** (publishes to Test PyPI only):

   - Go to GitHub Actions → "publish-test" workflow
   - Click "Run workflow"
   - No git tag needed!

2. **Install from Test PyPI**:

   ```bash
   pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ pipecat-ai-small-webrtc-prebuilt
   ```

3. **Test your changes**, then use the regular `publish` workflow for production

### Local Build Testing

To test the build locally before publishing:

```bash
# Build the client
cd client
npm install
npm run build
cd ..

# Copy client to package
mkdir -p pipecat_ai_small_webrtc_prebuilt/client
cp -r client/dist pipecat_ai_small_webrtc_prebuilt/client/

# Build the package
uv build

# Clean up
rm -rf pipecat_ai_small_webrtc_prebuilt/client
```
