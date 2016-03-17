# Install node.js on raspberry
- https://nodejs.org/dist/
- rasp2 -> arm7l.tar

# Install on Windows
- npm install

# Install on raspberry (debian)
- sudo apt-get install mpg123
- npm install

# Run daemon
- npm start

# Customize daemon
- use config.local.js

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
    
    
# tod
- make pacjage inside core
- buddy update
- extract web server