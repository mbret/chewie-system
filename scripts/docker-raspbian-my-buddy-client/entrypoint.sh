#!/bin/bash
cd /home
git clone https://github.com/my-buddy/my-buddy-app-base.git my-buddy
echo "Project cloning done, moving to project directory"
cd /home/my-buddy
echo "Installing project"
npm install
echo "Project installed, now try to run it"
node index.js