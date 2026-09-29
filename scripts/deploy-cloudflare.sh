#!/usr/bin/env bash
# Build rồi tải thẳng thư mục dist/ lên Cloudflare Pages.
# Dữ liệu cặp đôi thật chỉ nằm trên máy, không cần đưa lên GitHub.
#
#   scripts/deploy-cloudflare.sh              build tất cả rồi đăng
#   scripts/deploy-cloudflare.sh a-b    chỉ build lại một cặp rồi đăng
#   CF_PAGES_PROJECT=ten-khac scripts/deploy-cloudflare.sh
#
# Lần đầu: chạy `npx wrangler login` để đăng nhập Cloudflare.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="${CF_PAGES_PROJECT:-thiep-cuoi}"

node build.js "$@"
npx --yes wrangler pages deploy dist --project-name "$PROJECT" --branch main --commit-dirty=true
