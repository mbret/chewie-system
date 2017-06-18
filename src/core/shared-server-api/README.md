With every chewie system comes an api that do both control and database.

# System api
The service provide an api to the system. It may be used to control the system directly. There is not data stored
it's only a way to control your system.
ex: restart, shutdown, etc.

# System shared database
The database store every data of the system but also other system. You are able to connect any chewie to any other
chewie api. This way you handle your data in only one place.

# info
You can change the configuration like the port, etc. See .user.conf.json for more details.