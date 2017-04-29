'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function(db) {
    let create = String(require("fs").readFileSync(__dirname + "/create-database.sql"));
    let defaultData = String(require("fs").readFileSync(__dirname + "/default-data.sql"));
    return db
        .runSql(create)
        .then(function() {
            return db.runSql(defaultData);
        });
};

exports.down = function(db) {
    return null;
};

exports._meta = {
    "version": 1
};
