#!/usr/bin/env bash
set -e

echo ""
echo "  Pronunciation Coach — Session Bootstrap"
echo "  ======================================"
echo ""

if [ -d .git ]; then
    echo "Recent commits:"
    git log --oneline -5 2>/dev/null || true
    echo ""
else
    echo "(No git repository initialized yet)"
    echo ""
fi

echo "Backlog status:"
if [ -f docs/backlog/README.md ]; then
    head -30 docs/backlog/README.md
else
    echo "  (no backlog yet)"
fi
echo ""

echo "Build check (if package.json exists):"
if [ -f package.json ]; then
    npm run build 2>&1 | tail -5 || true
fi

echo ""
echo "Ready. Read docs/backlog/README.md and docs/prd.md first."
echo "Recommended: Start with F1 (Scaffold) tasks."
echo ""
