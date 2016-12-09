#!/bin/bash
cd /home
echo "moved to /home"
git clone https://github.com/mbret/chewie-system.git
echo "chewie-system cloned"
git clone https://github.com/mbret/chewie-app.git
echo "chewie-app cloned"
cd /home/chewie-system
echo "moved to /home/chewie-system"
npm install
cd /home/chewie-app
echo "moved to /home/chewie-app"
npm install