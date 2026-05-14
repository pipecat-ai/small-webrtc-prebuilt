# Pipecat AI Prebuilt

A simple, ready-to-use prebuilt client supporting all Pipecat transports.

This prebuilt client provides a lightweight UI to quickly test and verify transport
behavior without needing a custom implementation.

Ideal for development, debugging, and quick prototyping.

---

## 📦 Installation & Usage

If you just want to **use** the prebuilt client in your own Python project:

### ✅ Install from PyPI

```bash
pip install pipecat-ai-prebuilt
```

### 🧰 Example Usage

```python
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from pipecat_ai_prebuilt.frontend import PipecatPrebuiltUI

app = FastAPI()

# Mount the frontend at /client
app.mount("/client", PipecatPrebuiltUI)

@app.get("/", include_in_schema=False)
async def root_redirect():
    return RedirectResponse(url="/client/")
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
git clone https://github.com/pipecat-ai/pipecat-prebuilt.git
cd pipecat-ai-prebuilt
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
   version = "1.0.0"
   ```

2. **Create a git tag:**
   ```bash
   git tag -m v1.0.0 v1.0.0
   git push --tags origin
   ```

### Publishing Process

1. **Go to GitHub Actions** in your repository
2. **Select the "publish" workflow**
3. **Click "Run workflow"**
4. **Enter the git tag** (e.g., `v1.0.0`)
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
   pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ pipecat-ai-prebuilt
   ```

3. **Test your changes**, then use the regular `publish` workflow for production

### Local Build Testing

To test the build locally before publishing, use the provided build script.
It builds the React client, bundles it into the Python package, and produces the distribution artifacts in `dist/`.

**Run from the repo root:**

```bash
./scripts/local_build.sh
```

The script will:

1. Clear any previous `dist/` artifacts
2. Install client npm dependencies
3. Build the React client (`client/dist/`)
4. Copy the built client into the Python package
5. Build the Python package with `uv build`
6. Clean up the temporary client copy

The resulting `.whl` and `.tar.gz` files will be in `dist/`. You can install the wheel directly to test it:

```bash
pip install dist/pipecat_ai_prebuilt-*.whl
```
