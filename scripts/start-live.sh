#!/bin/bash
# Orphan-spawn the dev server: script exits immediately, server keeps running.
cd /home/z/my-project
nohup ./node_modules/.bin/next dev -p 3000 > /tmp/live-server.log 2>&1 &
echo "spawned pid $!"
exit 0
