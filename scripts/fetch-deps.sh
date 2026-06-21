#!/bin/sh
# Clones and builds sibling packages into _deps/ before npm install resolves them.
# Skipped locally if the directory already has source (symlink or existing clone).
set -e

mkdir -p _deps

fetch() {
  local name=$1
  local repo=$2
  if [ ! -f "_deps/$name/package.json" ]; then
    echo "[fetch-deps] cloning $repo → _deps/$name"
    git clone --depth 1 "https://github.com/TroodInc/$repo" "_deps/$name" --quiet
    (cd "_deps/$name" && npm install --silent && npm run build)
  else
    echo "[fetch-deps] _deps/$name already present, skipping"
  fi
}

fetch "telegram-channel-reader" "telegram-channel-reader"
fetch "article-extractor"       "article-extractor"
fetch "semantic-skills"         "embedding-utils"
fetch "topic-memory-db"         "topic-memory-db"
fetch "discourse-api-client"    "discourse-api-client"
