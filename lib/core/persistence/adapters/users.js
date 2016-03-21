'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('UsersPersistence');
var uuid = require('uuid');
var BaseAdapter = require('../base-adapter');
var bcrypt = require('bcrypt-nodejs');

class UsersAdapter extends BaseAdapter{

    constructor(system, persistence){
        super(system, persistence, 'users');
    }

    encryptPassword(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10)); 
    }

    comparePassword(raw, encrypted){
        return bcrypt.compareSync(raw, encrypted);
    }

    /**
     *
     */
    loadOrCreate(cb){
        var self = this;
        var query = {

        };

        this.persistence.find(this.db, query, function(err, row){
            if(err) return cb(err);

            if(row){
                return cb(null, row);
            }

            logger.info('No user found yet. Creating...');
            self.persistence.createOrUpdate(self.db, self._getDefaultUserData(), {}, function(err, row, inserted){
                if(err) return cb(err);

                return cb(null, inserted);
            });
        });
    }

    save(id, user, cb){

        var query = {
            _id: id,
        };

        this.persistence.saveOrUpdate(this.db, user, query, cb);
    }

    //_getDefaultUserData(){
    //    return {
    //        login: 'admin',
    //        password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10)),
    //        email: null,
    //
    //        profil: {
    //            firstName: null,
    //            lastName: null,
    //            birthdate: null,
    //        },
    //
    //        credentials: {
    //            google: {
    //
    //            }
    //        },
    //
    //        config: {
    //
    //            // Used to store external services credentials
    //            externalServices: {
    //                google: {
    //                    auth: {
    //                        clientId: null,
    //                        clientSecret: null
    //                    }
    //                }
    //            },
    //
    //            screens: [
    //                // default screen
    //                {
    //                    id: uuid.v1(),
    //                    name: 'Default',
    //                    description: 'This is your first screen'
    //                }
    //            ]
    //        }
    //    }
    //}
}

module.exports = UsersAdapter;