#!/bin/bash
#
# Build submodule tracked dependencies
#

set -e

# Copy fonts if the optional font submodule exists
if [ -d deps/fonts/NeueHaasGroteskDisplay ]; then
  cp -r deps/fonts/NeueHaasGroteskDisplay/ static/fonts/NeueHaasGroteskDisplay
  cp -r deps/fonts/NeueHaasGroteskText/ static/fonts/NeueHaasGroteskText
fi
