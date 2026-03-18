#!/bin/bash
#
# Build submodule tracked dependencies
#

set -e

# Copy commercial fonts if the optional font checkout exists.
# Keep this Docker build path intentionally simple so it only relies on
# base POSIX tooling present in the Node images we build with.
if [ -d deps/fonts/NeueHaasGroteskDisplay ] && [ -d deps/fonts/NeueHaasGroteskText ]; then
  rm -rf static/fonts/NeueHaasGroteskDisplay static/fonts/NeueHaasGroteskText
  cp -R deps/fonts/NeueHaasGroteskDisplay static/fonts/NeueHaasGroteskDisplay
  cp -R deps/fonts/NeueHaasGroteskText static/fonts/NeueHaasGroteskText
fi
