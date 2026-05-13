# Pipecat Prebuilt Test App

This is a simple example app to help you test your Pipecat bot with a prebuilt UI and a basic Python backend.

---

## 📋 Prerequisites

- [uv](https://docs.astral.sh/uv/) installed on your system
- [Node.js](https://nodejs.org/) (for building the client, if not already built)

---

## 🚀 Setup

1. **Build the client (if not already built):**

   The prebuilt UI package serves a built React client. If you're developing locally, you need to build it first:

   ```bash
   cd ../client
   npm install
   npm run build
   cd ../test
   ```

   > **Note:** If you installed the package from PyPI, skip this step—the client is already built and bundled.

2. **Install dependencies:**

   ```bash
   uv sync
   ```

   This will:

   - Create a virtual environment automatically
   - Install all dependencies from `pyproject.toml`
   - Install the local `pipecat-ai-prebuilt` package in editable mode

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

4. **Add API keys** to your `.env` file for:

   - Google (e.g., for Speech-to-Text or other services)

---

## ▶️ Run the Example

Once setup is complete, start the app with:

```bash
uv run bot.py
```

## 🎉 Test with Pipecat AI Prebuilt UI

Open your browser and navigate to:
👉 http://localhost:7860

- (Or use your custom port, if configured)
