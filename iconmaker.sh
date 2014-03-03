#!/bin/bash
# Generate PhoneGap icon and splash screens.
# Copyright 2013 Tom Vincent <http://tlvince.com/contact>

usage() { echo "usage: $0 icon land port"; exit 1; }

[ "$1" ] && [ "$2" ] || usage

devices=android,bada,bada-wac,blackberry,ios,webos,windows-phone
eval mkdir -p "res/{icon,screen}/{$devices}"

# Show the user some progress by outputing all commands being run.
set -x

# Explicitly set background in case image is transparent (see: #3)
convert="convert -background none"
$convert "$1" -resize 128x128 "res/icon/icon.png"
$convert "$1" -resize 36x36 "res/icon/android/icon-36-ldpi.png"
$convert "$1" -resize 72x72 "res/icon/android/icon-72-hdpi.png"
$convert "$1" -resize 48x48 "res/icon/android/icon-48-mdpi.png"
$convert "$1" -resize 96x96 "res/icon/android/icon-96-xhdpi.png"
$convert "$1" -resize 128x128 "res/icon/bada/icon-128.png"
$convert "$1" -resize 48x48 "res/icon/bada-wac/icon-48-type5.png"
$convert "$1" -resize 80x80 "res/icon/bada-wac/icon-80-type4.png"
$convert "$1" -resize 50x50 "res/icon/bada-wac/icon-50-type3.png"
$convert "$1" -resize 80x80 "res/icon/blackberry/icon-80.png"
$convert "$1" -resize 57x57 "res/icon/ios/icon-57.png"
$convert "$1" -resize 72x72 "res/icon/ios/icon-72.png"
$convert "$1" -resize 144x144 "res/icon/ios/icon-72-2x.png"
$convert "$1" -resize 114x114 "res/icon/ios/icon-57-2x.png"
$convert "$1" -resize 64x64 "res/icon/webos/icon-64.png"
$convert "$1" -resize 48x48 "res/icon/windows-phone/icon-48.png"
$convert "$1" -resize 173x173 "res/icon/windows-phone/icon-173-tile.png"
$convert "$1" -resize 62x62 "res/icon/windows-phone/icon-62-tile.png"

convertl="convert $2 -gravity center"
convertp="convert $3 -gravity center"
$convertl -resize 1280x720^ -extent 1280x720 "res/screen/android/screen-xhdpi-landscape.png"
$convertp -resize 480x800^ -extent 480x800 "res/screen/android/screen-hdpi-portrait.png"
$convertl -resize 320x200^ -extent 320x200 "res/screen/android/screen-ldpi-landscape.png"
$convertp -resize 720x1280^ -extent 720x1280 "res/screen/android/screen-xhdpi-portrait.png"
$convertp -resize 320x480^ -extent 320x480 "res/screen/android/screen-mdpi-portrait.png"
$convertl -resize 480x320^ -extent 480x320 "res/screen/android/screen-mdpi-landscape.png"
$convertp -resize 200x320^ -extent 200x320 "res/screen/android/screen-ldpi-portrait.png"
$convertl -resize 800x480^ -extent 800x480 "res/screen/android/screen-hdpi-landscape.png"
$convertp -resize 320x480^ -extent 320x480 "res/screen/ios/Default~iphone.png"
$convertp -resize 640x960^ -extent 640x960 "res/screen/ios/Default@2x~iphone.png"
$convertp -resize 640x1136^ -extent 640x1136 "res/screen/ios/Default-568h@2x~iphone.png"
$convertp -resize 768x1024^ -extent 768x1024 "res/screen/ios/Default-Portrait~ipad.png"
$convertp -resize 1536x2048^ -extent 1536x2048 "res/screen/ios/Default-Portrait@2x~ipad.png"
$convertl -resize 1024x768^ -extent 1024x768 "res/screen/ios/Default-Landscape~ipad.png"
$convertl -resize 2048x1536^ -extent 2048x1536 "res/screen/ios/Default-Landscape@2x~ipad.png"
