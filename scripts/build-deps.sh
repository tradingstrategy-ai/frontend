#!/bin/bash
#
# Build submodule tracked dependencies
#

set -e

# Sync fonts if the optional font checkout exists
if [ -d deps/fonts ]; then
  bash scripts/setup-fonts.sh deps/fonts
fi
