#!/bin/bash

DESTINATION=$1
FILENAME=$2
ORIGINALNAME=$3
BASENAME=$4

mkdir -p converted/$FILENAME

echo $BASENAME

/usr/bin/ffmpeg -i $DESTINATION$FILENAME \
    -vframes 1 "converted/"$FILENAME"/"$BASENAME"_poster.jpg" \
    -c:v libx264 -vf scale=1920:-2 "converted/"$FILENAME"/"$BASENAME"_1920.mp4" \
    -c:v libx264 -vf scale=1280:-2 "converted/"$FILENAME"/"$BASENAME"_1280.mp4" \
    -c:v libx264 -vf scale=640:-2 "converted/"$FILENAME"/"$BASENAME"_640.mp4"

zip -r -j "public/downloads/"$FILENAME".zip" "converted/"$FILENAME

rm -rf $DESTINATION$FILENAME
rm -rf "converted/"$FILENAME
