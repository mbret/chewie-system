![Image of Chewbacca](https://image.ibb.co/eKvgov/chewie.jpg)
(Image not related to the project)

[![version](https://img.shields.io/npm/v/chewie-system.svg)](https://www.npmjs.org/package/chewie-system)
[![status](https://travis-ci.org/mbret/chewie-system.svg)](https://travis-ci.org/mbret/chewie-system)
[![coverage](https://img.shields.io/coveralls/mbret/chewie-system.svg)](https://coveralls.io/github/mbret/chewie-system)
[![dependencies](https://david-dm.org/mbret/chewie-system.svg)](https://david-dm.org/mbret/chewie-system)
[![devDependencies](https://david-dm.org/mbret/chewie-system/dev-status.svg)](https://david-dm.org/mbret/chewie-system#info=devDependencies)
![node](https://img.shields.io/node/v/chewie-system.svg)

# Chewie system
For more information go to [chewie](https://github.com/mbret/chewie) home page.

## Install node.js on raspberry
- https://nodejs.org/dist/
- rasp2 -> arm7l.tar or arm6l.tar
- you can download directly binaries and copy the content inside /usr/local or /etc/node. Remember to add to your path node & npm

## Install on Windows
- npm install -g gulp
- npm install node-gyp (because some modules needs to be compiled then and will fail if you do not previously download gyp)
- npm install

## Install on raspberry (debian)
- apt-get install mpg123
- npm install -g gulp
- sudo apt-get install python-software-properties python g++ make (for node-gyp to work)
- sudo npm install node-gyp -g (because some modules needs to be compiled then and will fail if you do not previously download gyp)
- npm install

## Test system
- npm test

Task:
    - schedule
        - say
        - write
    - command
        - vocal
        - write

## screens idea
- latests mails
- latests social notifications
- weather
- incoming calendar events (google)

## Project keywords
semaphore lock db-migration nodejs javascript rest server-http shared-resources vocal-synthesis system speaker module plugins mobilizable-system 

Generator
https://github.com/expressjs/generator

run pm2 for dev on linux: pm2 start "/usr/local/bin/npm" --name "chewie-system" -- run start-dev
