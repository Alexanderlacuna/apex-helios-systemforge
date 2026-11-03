#!/usr/bin/env bash
# Create the GitHub repo (if missing) and push. Requires a PAT with 'repo' scope.
# Usage: GITHUB_TOKEN=ghp_xxx ./deploy.sh [owner] [repo]
set -euo pipefail

OWNER="${1:-Alexanderlacuna}"
REPO="${2:-apex-helios-systemforge}"
: "${GITHUB_TOKEN:?set GITHUB_TOKEN to a PAT with repo scope}"

echo "→ ensuring $OWNER/$REPO exists"
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO")
if [ "$code" = "404" ]; then
  curl -sS -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO\",\"description\":\"APEX HELIOS SYSTEMFORGE — business landing page\",\"private\":false,\"has_issues\":true,\"has_wiki\":false}" \
    > /dev/null
  echo "  created"
else
  echo "  already exists"
fi

echo "→ pushing main"
git remote remove origin 2>/dev/null || true
git remote add origin "git@github.com:$OWNER/$REPO.git"
git push -u origin main

echo
echo "✓ pushed. The Actions workflow will enable Pages and deploy."
echo "  Live URL: https://$(echo "$OWNER" | tr '[:upper:]' '[:lower:]').github.io/$REPO/"
