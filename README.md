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
uv run python run.py
```

Then open http://localhost:7860 in your browser.

## 🚀 Publishing

- Prepare to dist:

```shell
./scripts/prepare_dist.sh
```

- Test the build using TestPyPI with Twine:

Upload to TestPyPI using twine

```shell
twine upload --repository testpypi dist/*
```

Uninstall previous production version

```shell
pip uninstall pipecat-ai-small-webrtc-prebuilt
```

Test using pip to download packages from TestPyPI instead of PyPI

```shell
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ pipecat-ai-small-webrtc-prebuilt
```

Double check version

```shell
pip list |grep pipecat-ai-small-webrtc-prebuilt
```

Run test...

Once you are happy, publish it to production.

```shell
twine upload dist/*
```

Profit.
