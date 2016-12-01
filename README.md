# Install node.js on raspberry
- https://nodejs.org/dist/
- rasp2 -> arm7l.tar or arm6l.tar
- you can download directly binaries and copy the content inside /usr/local or /etc/node. Remember to add to your path node & npm

# Install on Windows
- npm install -g gulp
- npm install node-gyp (because some modules needs to be compiled then and will fail if you do not previously download gyp)
- npm install

# Install on raspberry (debian)
- apt-get install mpg123
- npm install -g gulp
- sudo apt-get install python-software-properties python g++ make (for node-gyp to work)
- sudo npm install node-gyp -g (because some modules needs to be compiled then and will fail if you do not previously download gyp)
- npm install

# Run system
- npm start

# Test system
- npm test

# Customize system
- check /config folder

Task:
    - schedule
        - say
        - write
    - command
        - vocal
        - write

# Understand configurations
- System configuration:
The main configuration. It's defined in a config.js inside the lib. It can be extended with user config. Some config entries are also changeable by user directly. Then they are stored inside db.
Here is the priority order:
1. config.js from lib.
2. config.js's from user.
3. config.js from db.

- User configuration
The second configuration. It's defined by default through the app but is mainly defined by database. 
They are different for each user while system config is unique.
Here is the priority order:
1. config from database.

# Technical vocabulary
- Module: Core module, User module, .. are all module.
    - User modules:
        - Task
- Plugin: The plugin is an external plugable component which deal with modules.

# screens idea
- latests mails
- latests social notifications
- weather
- incoming calendar events (google)

Generator
https://github.com/expressjs/generator