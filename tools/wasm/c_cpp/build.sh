#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Ensure emcc is available
if ! command -v emcc &> /dev/null
then
    echo "emcc could not be found. Please install Emscripten SDK."
    echo "See: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Compile alg.c to WASM
emcc alg.c -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -o dist/alg.js

echo "WASM compilation complete. Output in dist/alg.js and dist/alg.wasm"
