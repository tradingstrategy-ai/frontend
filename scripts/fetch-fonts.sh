#/bin/bash
#
# Get commercial fonts from the private repository
#
# Set $FONT_ZIP_DOWNLOAD_URL point to the zip file.
#

set -e
set -x

if [ -e /tmp/fonts ] ; then
  rm -rf /tmp/fonts
fi

wget "$FONT_ZIP_DOWNLOAD_URL" -O /tmp/fonts.zip
(cd /tmp && unzip fonts)
cp -r /tmp/fonts/NeueHaasGroteskDisplay/ static/fonts/NeueHaasGroteskDisplay
cp -r /tmp/fonts/NeueHaasGroteskText/ static/fonts/NeueHaasGroteskText
