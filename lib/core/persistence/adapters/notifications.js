'use strict';

var BaseAdapter = require('../base-adapter');

class NotificationsAdapter extends BaseAdapter {

    constructor(system, persistence){
        super(system, persistence, 'notifications');
    }

}

module.exports = NotificationsAdapter;