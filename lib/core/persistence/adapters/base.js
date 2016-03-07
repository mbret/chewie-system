'use strict';

class BaseAdapter{

    constructor(persistence){
        this.persistence = persistence;
        this.db = null;
    }

    getPersistence(){
        return this.persistence;
    }

    setDb(db){
        this.db = db;
    }
}

module.exports = BaseAdapter;