#!/bin/bash
cd /home
echo "moved to /home"
git clone https://github.com/mbret/chewie-app.git
echo "chewie-app cloned"
cd /home/chewie-app
echo "moved to /home/chewie-app"
yarn install
npm run start