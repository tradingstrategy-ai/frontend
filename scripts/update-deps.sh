#!/bin/bash
#
# Update all git submodule dependencies
#

set -e
set -x
(cd deps/fonts && git pull origin main)
(cd deps/trade-executor-frontend && git pull origin master)
