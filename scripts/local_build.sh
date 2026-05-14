#!/usr/bin/env bash
set -euo pipefail

# Ensure this script is run from the repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ "$(pwd)" != "$REPO_ROOT" ]]; then
  echo "❌ Error: run this script from the repo root."
  echo "   cd $REPO_ROOT && ./scripts/local_build.sh"
  exit 1
fi

if [[ ! -f "pyproject.toml" || ! -d "client" ]]; then
  echo "❌ Error: expected pyproject.toml and client/ to exist in the current directory."
  exit 1
fi

echo "🧹 Clearing previous build artifacts..."
rm -rf dist

echo "📦 Installing client dependencies..."
npm --prefix client install

echo "🔨 Building client..."
npm --prefix client run build

echo "📂 Copying client dist into Python package..."
mkdir -p pipecat_ai_prebuilt/client
cp -r client/dist pipecat_ai_prebuilt/client/

echo "🐍 Building Python package..."
uv build

echo "🧹 Cleaning up temporary client copy..."
rm -rf pipecat_ai_prebuilt/client

echo ""
echo "✅ Build complete! Artifacts are in dist/"
ls dist/
