#!/bin/bash
set -euo pipefail

# Re-register the 21st MCP server on each new web session.
# Requires TWENTYFIRST_API_KEY to be set as an environment variable in the
# Claude Code environment settings (never commit the key itself to git).

if [ -z "${TWENTYFIRST_API_KEY:-}" ]; then
  exit 0
fi

if claude mcp get 21st >/dev/null 2>&1; then
  exit 0
fi

claude mcp add --transport http 21st https://21st.dev/api/mcp \
  --header "x-api-key: ${TWENTYFIRST_API_KEY}" >/dev/null
