#!/bin/bash
set -e

cd "$(dirname "$0")"
npm install --no-audit --no-fund
node src/index.js "$@"
