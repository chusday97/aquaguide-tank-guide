#!/bin/bash
set -e

PROJECT="AquaGuide"
ROOT="$HOME/aquaguide-final-ui-rc1"

cd "$ROOT"

echo "🚀 $PROJECT Dev Entry"
echo "Path: $(pwd)"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git rev-parse --short HEAD)"
echo ""
echo "Git Status:"
git status --short

echo ""
echo "AI Status:"
cat .ai/CURRENT_GOAL.md 2>/dev/null || true
