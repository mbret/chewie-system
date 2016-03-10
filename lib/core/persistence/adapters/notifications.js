'use strict';

var BaseAdapter = require('../base-adapter');

class NotificationsAdapter extends BaseAdapter {

    constructor(persistence){
        super(persistence, 'notifications');
    }

}

module.exports = NotificationsAdapter;